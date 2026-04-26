// ── Readings routes ────────────────────────────────────────────────────────────
import { Router } from "express";
import { db, cached } from "../db/client.js";
import { readings, users, readingUpvotes } from "../db/schema.js";
import { sql, eq, and, desc, asc, type SQL } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { writeLimiter, userWriteLimiter } from "../middleware/rateLimiter.js";
import { sendCached } from "../middleware/cache.js";
import { queryCache } from "../lib/cache.js";
import { readingSubmitSchema } from "../lib/schemas.js";

const router = Router();

// GET /api/readings
// Query params: type, difficulty, topic, sort (top|newest|alpha), page, limit
router.get("/", async (req, res) => {
  try {
    const { type, difficulty, topic, sort = "newest", page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset   = (pageNum - 1) * limitNum;

    const cacheKey = `readings:${type ?? ""}:${difficulty ?? ""}:${topic ?? ""}:${sort}:${pageNum}:${limitNum}`;

    const data = await cached(cacheKey, async () => {
      // Build WHERE conditions dynamically — no null-cast workaround needed
      const conditions: SQL[] = [eq(readings.isApproved, true)];
      if (type)       conditions.push(eq(readings.type, type));
      if (difficulty) conditions.push(eq(readings.difficulty, difficulty));
      if (topic)      conditions.push(sql`${topic} = ANY(${readings.topics})`);

      // Type-safe ORDER BY — no raw string injection
      const orderCols =
        sort === "newest" ? [desc(readings.createdAt), desc(readings.id)] :
        sort === "alpha"  ? [asc(readings.title),     desc(readings.id)] :
                            [desc(readings.upvotes),  desc(readings.id)]; // default: top

      const rows = await db
        .select({
          id:          readings.id,
          type:        readings.type,
          title:       readings.title,
          url:         readings.url,
          topics:      readings.topics,
          difficulty:  readings.difficulty,
          upvotes:     readings.upvotes,
          createdAt:   readings.createdAt,
          notes:       readings.notes,
          displayName: users.displayName,
          github:      users.github,
          linkedin:    users.linkedin,
        })
        .from(readings)
        .leftJoin(users, eq(readings.submittedBy, users.id))
        .where(and(...conditions))
        .orderBy(...orderCols)
        .limit(limitNum)
        .offset(offset);

      return rows.map((r) => ({
        id:         r.id,
        type:       r.type,
        title:      r.title,
        url:        r.url,
        addedBy:    r.displayName ?? "Maintainer",
        githubUser: r.github ?? undefined,
        linkedin:   r.linkedin ?? undefined,
        topics:     r.topics,
        difficulty: r.difficulty ?? undefined,
        upvotes:    r.upvotes,
        createdAt:  r.createdAt,
        notes:      r.notes ?? undefined,
      }));
    });

    sendCached(res, req, { data, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

// POST /api/readings/submit — auth-required community submission (lands as is_approved=false)
router.post("/submit", requireAuth, writeLimiter, userWriteLimiter, async (req, res) => {
  const parsed = readingSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" });
    return;
  }
  const { type, title, url, topics, difficulty, notes } = parsed.data;

  try {
    await db.insert(readings).values({
      type, title, url, topics,
      difficulty: difficulty ?? null,
      notes:      notes ?? null,
      upvotes:    0,
      isApproved: false,
      submittedBy: req.user!.id,
    });
    queryCache.invalidate("readings:");
    queryCache.invalidate("bootstrap:");
    res.status(201).json({ message: "Submission received — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit reading" });
  }
});

// POST /api/readings/:id/upvote — toggle on (auth required)
router.post("/:id/upvote", requireAuth, writeLimiter, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.insert(readingUpvotes)
      .values({ userId: req.user!.id, readingId: id })
      .onConflictDoNothing();

    const [updated] = await db
      .update(readings)
      .set({ upvotes: sql`${readings.upvotes} + 1` })
      .where(and(eq(readings.id, id), eq(readings.isApproved, true)))
      .returning({ upvotes: readings.upvotes });

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("readings:");
    queryCache.invalidate("bootstrap:");
    res.json({ upvoted: true, upvotes: updated.upvotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upvote" });
  }
});

// DELETE /api/readings/:id/upvote — toggle off
router.delete("/:id/upvote", requireAuth, writeLimiter, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.delete(readingUpvotes)
      .where(and(eq(readingUpvotes.userId, req.user!.id), eq(readingUpvotes.readingId, id)));

    const [updated] = await db
      .update(readings)
      .set({ upvotes: sql`GREATEST(${readings.upvotes} - 1, 0)` })
      .where(and(eq(readings.id, id), eq(readings.isApproved, true)))
      .returning({ upvotes: readings.upvotes });

    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("readings:");
    queryCache.invalidate("bootstrap:");
    res.json({ upvoted: false, upvotes: updated.upvotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove upvote" });
  }
});

// PATCH /api/readings/:id/approve — admin only
router.patch("/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await db
      .update(readings)
      .set({ isApproved: true })
      .where(eq(readings.id, id))
      .returning({ id: readings.id });
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("readings:");
    queryCache.invalidate("bootstrap:");
    res.json({ approved: true, id: updated.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

export default router;
