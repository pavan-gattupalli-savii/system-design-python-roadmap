// ── Bookmarks routes ───────────────────────────────────────────────────────────
// POST /api/bookmarks  — add a bookmark (idempotent)
// DELETE /api/bookmarks — remove a bookmark
// Both require auth. Bookmark state is loaded via GET /api/me/bookmarks.

import { Router } from "express";
import { db } from "../db/client.js";
import { bookmarks } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { bookmarkSchema } from "../lib/schemas.js";

const router = Router();

router.use(requireAuth);

// POST /api/bookmarks — { resourceType, resourceId }
router.post("/", writeLimiter, async (req, res) => {
  const parsed = bookmarkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid bookmark" });
    return;
  }
  const { resourceType, resourceId } = parsed.data;
  const userId = req.user!.id;

  try {
    await db
      .insert(bookmarks)
      .values({ userId, resourceType, resourceId })
      .onConflictDoNothing();
    res.json({ ok: true, bookmarked: true, resourceType, resourceId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save bookmark" });
  }
});

// DELETE /api/bookmarks — { resourceType, resourceId }
router.delete("/", writeLimiter, async (req, res) => {
  const parsed = bookmarkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid bookmark" });
    return;
  }
  const { resourceType, resourceId } = parsed.data;
  const userId = req.user!.id;

  try {
    await db.delete(bookmarks).where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.resourceType, resourceType),
        eq(bookmarks.resourceId, resourceId),
      ),
    );
    res.json({ ok: true, bookmarked: false, resourceType, resourceId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

export default router;
