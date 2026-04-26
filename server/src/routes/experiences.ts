// ── Experiences routes ────────────────────────────────────────────────────────
import { Router } from "express";
import { db, cached } from "../db/client.js";
import { experiences, users, experienceUpvotes } from "../db/schema.js";
import { sql, eq, and, desc, asc, type SQL } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { writeLimiter, userWriteLimiter } from "../middleware/rateLimiter.js";
import { sendCached } from "../middleware/cache.js";
import { queryCache } from "../lib/cache.js";
import { experienceSubmitSchema } from "../lib/schemas.js";

const router = Router();

// GET /api/experiences
router.get("/", async (req, res) => {
  try {
    const { platform, company, outcome, sort = "newest", page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset   = (pageNum - 1) * limitNum;

    const cacheKey = `experiences:${platform ?? ""}:${company ?? ""}:${outcome ?? ""}:${sort}:${pageNum}:${limitNum}`;

    const data = await cached(cacheKey, async () => {
      const conditions: SQL[] = [eq(experiences.isApproved, true)];
      if (platform) conditions.push(eq(experiences.platform, platform));
      if (company)  conditions.push(eq(experiences.company, company));
      if (outcome)  conditions.push(eq(experiences.outcome, outcome));

      const orderCols =
        sort === "newest" ? [desc(experiences.createdAt), desc(experiences.id)] :
        sort === "alpha"  ? [asc(experiences.title),      desc(experiences.id)] :
                            [desc(experiences.upvotes),   desc(experiences.id)];

      const rows = await db
        .select({
          id:          experiences.id,
          title:       experiences.title,
          url:         experiences.url,
          platform:    experiences.platform,
          company:     experiences.company,
          role:        experiences.role,
          outcome:     experiences.outcome,
          topics:      experiences.topics,
          notes:       experiences.notes,
          upvotes:     experiences.upvotes,
          createdAt:   experiences.createdAt,
          displayName: users.displayName,
          github:      users.github,
          linkedin:    users.linkedin,
        })
        .from(experiences)
        .leftJoin(users, eq(experiences.submittedBy, users.id))
        .where(and(...conditions))
        .orderBy(...orderCols)
        .limit(limitNum)
        .offset(offset);

      return rows.map((e) => ({
        id:         e.id,
        title:      e.title,
        url:        e.url,
        platform:   e.platform,
        company:    e.company,
        role:       e.role,
        outcome:    e.outcome ?? undefined,
        topics:     e.topics,
        notes:      e.notes ?? undefined,
        upvotes:    e.upvotes,
        addedBy:    e.displayName ?? "Maintainer",
        githubUser: e.github ?? undefined,
        linkedin:   e.linkedin ?? undefined,
        createdAt:  e.createdAt,
      }));
    });

    sendCached(res, req, { data, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

// POST /api/experiences/submit — auth required
router.post("/submit", requireAuth, writeLimiter, userWriteLimiter, async (req, res) => {
  const parsed = experienceSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" });
    return;
  }
  const { title, url, platform, company, role, outcome, topics, notes } = parsed.data;

  try {
    await db.insert(experiences).values({
      title, url, platform, company, role,
      outcome: outcome ?? null,
      topics,
      notes:      notes ?? null,
      upvotes:    0,
      isApproved: false,
      submittedBy: req.user!.id,
    });
    queryCache.invalidate("experiences:");
    queryCache.invalidate("bootstrap:");
    res.status(201).json({ message: "Experience submitted — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit experience" });
  }
});

// POST /api/experiences/:id/upvote — toggle on (auth required)
router.post("/:id/upvote", requireAuth, writeLimiter, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.insert(experienceUpvotes)
      .values({ userId: req.user!.id, experienceId: id })
      .onConflictDoNothing();

    const [updated] = await db
      .update(experiences)
      .set({ upvotes: sql`${experiences.upvotes} + 1` })
      .where(and(eq(experiences.id, id), eq(experiences.isApproved, true)))
      .returning({ upvotes: experiences.upvotes });

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("experiences:");
    queryCache.invalidate("bootstrap:");
    res.json({ upvoted: true, upvotes: updated.upvotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upvote" });
  }
});

// DELETE /api/experiences/:id/upvote — toggle off
router.delete("/:id/upvote", requireAuth, writeLimiter, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.delete(experienceUpvotes)
      .where(and(eq(experienceUpvotes.userId, req.user!.id), eq(experienceUpvotes.experienceId, id)));

    const [updated] = await db
      .update(experiences)
      .set({ upvotes: sql`GREATEST(${experiences.upvotes} - 1, 0)` })
      .where(and(eq(experiences.id, id), eq(experiences.isApproved, true)))
      .returning({ upvotes: experiences.upvotes });

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("experiences:");
    queryCache.invalidate("bootstrap:");
    res.json({ upvoted: false, upvotes: updated.upvotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove upvote" });
  }
});

// PATCH /api/experiences/:id/approve — admin
router.patch("/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await db
      .update(experiences)
      .set({ isApproved: true })
      .where(eq(experiences.id, id))
      .returning({ id: experiences.id });
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("experiences:");
    queryCache.invalidate("bootstrap:");
    res.json({ approved: true, id: updated.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

export default router;
