// ── Build submission routes ───────────────────────────────────────────────────
// Allows authenticated users to submit, update, delete, and list their GitHub
// build assignment links for roadmap resources.

import { Router } from "express";
import { db } from "../db/client.js";
import { buildSubmissions } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { buildSubmitSchema } from "../lib/schemas.js";

const router = Router();
router.use(requireAuth);

// GET /api/builds?language=python
// Returns all build submissions for the current user + language.
router.get("/", async (req, res) => {
  const lang = req.query.language === "java" ? "java" : "python";
  try {
    const rows = await db
      .select({
        resourceKey: buildSubmissions.resourceKey,
        githubUrl:   buildSubmissions.githubUrl,
        notes:       buildSubmissions.notes,
        submittedAt: buildSubmissions.submittedAt,
        updatedAt:   buildSubmissions.updatedAt,
      })
      .from(buildSubmissions)
      .where(
        and(
          eq(buildSubmissions.userId, req.user!.id),
          eq(buildSubmissions.language, lang),
        ),
      );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load build submissions" });
  }
});

// POST /api/builds — upsert a build submission
router.post("/", writeLimiter, async (req, res) => {
  const parsed = buildSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" });
    return;
  }
  const { language, resourceKey, githubUrl, notes } = parsed.data;
  const userId = req.user!.id;

  try {
    await db
      .insert(buildSubmissions)
      .values({ userId, language, resourceKey, githubUrl, notes: notes ?? null, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [buildSubmissions.userId, buildSubmissions.language, buildSubmissions.resourceKey],
        set: {
          githubUrl,
          notes:     notes ?? null,
          updatedAt: sql`now()`,
        },
      });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save build submission" });
  }
});

// DELETE /api/builds/:resourceKey?language=python
router.delete("/:resourceKey", writeLimiter, async (req, res) => {
  const resourceKey = decodeURIComponent(req.params.resourceKey ?? "").trim();
  const lang = req.query.language === "java" ? "java" : "python";
  if (!resourceKey) {
    res.status(400).json({ error: "resourceKey is required" });
    return;
  }
  try {
    await db.delete(buildSubmissions).where(
      and(
        eq(buildSubmissions.userId, req.user!.id),
        eq(buildSubmissions.language, lang),
        eq(buildSubmissions.resourceKey, resourceKey),
      ),
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete build submission" });
  }
});

export default router;
