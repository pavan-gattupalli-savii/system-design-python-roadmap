// ── User notes routes ─────────────────────────────────────────────────────────
// Per-user markdown notes attached to a roadmap resource. resource_key is the
// same string the frontend builds via resId() — e.g. "3_15_2_0".

import { Router } from "express";
import { db } from "../db/client.js";
import { userNotes } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();
router.use(requireAuth);

const upsertSchema = z.object({
  language:    z.enum(["python", "java"]),
  resourceKey: z.string().min(1).max(64),
  bodyMd:      z.string().min(0).max(20_000),
});

// GET /api/me/notes?language=python — list all notes for the current user/lang
router.get("/", async (req, res) => {
  const lang = req.query.language === "java" ? "java" : "python";
  try {
    const rows = await db
      .select({
        resourceKey: userNotes.resourceKey,
        bodyMd:      userNotes.bodyMd,
        updatedAt:   userNotes.updatedAt,
      })
      .from(userNotes)
      .where(and(eq(userNotes.userId, req.user!.id), eq(userNotes.language, lang)));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load notes" });
  }
});

// POST /api/me/notes — upsert a note (body of "" deletes)
router.post("/", writeLimiter, async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid note" });
    return;
  }
  const { language, resourceKey, bodyMd } = parsed.data;
  const userId = req.user!.id;
  try {
    if (bodyMd.trim() === "") {
      await db.delete(userNotes).where(
        and(
          eq(userNotes.userId, userId),
          eq(userNotes.language, language),
          eq(userNotes.resourceKey, resourceKey),
        ),
      );
      res.json({ ok: true, deleted: true });
      return;
    }
    await db.insert(userNotes)
      .values({ userId, language, resourceKey, bodyMd, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [userNotes.userId, userNotes.language, userNotes.resourceKey],
        set:    { bodyMd, updatedAt: sql`now()` },
      });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// DELETE /api/me/notes/:resourceKey?language=python
router.delete("/:resourceKey", writeLimiter, async (req, res) => {
  const resourceKey = decodeURIComponent(req.params.resourceKey ?? "").trim();
  const lang = req.query.language === "java" ? "java" : "python";
  if (!resourceKey) {
    res.status(400).json({ error: "resourceKey is required" });
    return;
  }
  try {
    await db.delete(userNotes).where(
      and(
        eq(userNotes.userId, req.user!.id),
        eq(userNotes.language, lang),
        eq(userNotes.resourceKey, resourceKey),
      ),
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
