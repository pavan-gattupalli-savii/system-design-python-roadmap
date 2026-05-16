// ── Concepts routes ───────────────────────────────────────────────────────────
// Read-only endpoints serving the `concepts` table. The full list is small
// (~30 entries) so we return everything in a single request; the client filters
// by slug locally. A per-week endpoint joins through `concept_week_links`.

import { Router } from "express";
import { db } from "../db/client.js";
import { concepts, conceptWeekLinks } from "../db/schema.js";
import { eq, and, asc, inArray } from "drizzle-orm";
import { sendCached } from "../middleware/cache.js";

const router = Router();

// GET /api/concepts — all concepts, ordered by sortOrder
router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(concepts).orderBy(asc(concepts.sortOrder));
    sendCached(res, req, rows.map((c) => ({
      slug:             c.slug,
      title:            c.title,
      emoji:            c.emoji,
      category:         c.category,
      tagline:          c.tagline,
      sections:         c.sections,
      related:          c.related,
      roadmapKeywords:  c.roadmapKeywords,
    })), { maxAge: 3600, swr: 86400 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load concepts" });
  }
});

// GET /api/concepts/week/:language/:phase/:week — concepts linked to one week
router.get("/week/:language/:phase/:week", async (req, res) => {
  const lang = req.params.language === "java" ? "java" : "python";
  const phase = parseInt(req.params.phase, 10);
  const week  = parseInt(req.params.week, 10);
  if (!Number.isFinite(phase) || !Number.isFinite(week)) {
    res.status(400).json({ error: "phase and week must be numbers" });
    return;
  }
  try {
    const links = await db.select({ slug: conceptWeekLinks.conceptSlug })
      .from(conceptWeekLinks)
      .where(and(
        eq(conceptWeekLinks.language, lang),
        eq(conceptWeekLinks.phaseNumber, phase),
        eq(conceptWeekLinks.weekNumber, week),
      ));
    const slugs = links.map((l) => l.slug);
    if (!slugs.length) {
      res.json([]);
      return;
    }
    const rows = await db.select({
      slug:     concepts.slug,
      title:    concepts.title,
      emoji:    concepts.emoji,
      category: concepts.category,
      tagline:  concepts.tagline,
    })
      .from(concepts)
      .where(inArray(concepts.slug, slugs))
      .orderBy(asc(concepts.sortOrder));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load week concepts" });
  }
});

export default router;
