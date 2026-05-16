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

// GET /api/concepts — full list, including sections. Kept for back-compat with
// older clients; new code should call /summaries + /:slug instead to avoid
// shipping every section body up front (~250KB → ~5KB summaries + per-detail).
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

// GET /api/concepts/summaries — lightweight list for sidebar + category nav.
// Drops sections / related / roadmapKeywords to keep the payload small.
router.get("/summaries", async (req, res) => {
  try {
    const rows = await db
      .select({
        slug:     concepts.slug,
        title:    concepts.title,
        emoji:    concepts.emoji,
        category: concepts.category,
        tagline:  concepts.tagline,
      })
      .from(concepts)
      .orderBy(asc(concepts.sortOrder));
    sendCached(res, req, rows, { maxAge: 3600, swr: 86400 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load concept summaries" });
  }
});

// GET /api/concepts/week/:language/:phase/:week — concepts linked to one week.
// Declared BEFORE /:slug so "week" isn't matched as a slug.
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

// GET /api/concepts/:slug — full single concept. Must come AFTER /summaries
// and /week/... so those literal paths aren't matched as slugs.
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  if (!slug || slug.length > 64) {
    res.status(400).json({ error: "slug is required" });
    return;
  }
  try {
    const [row] = await db.select().from(concepts).where(eq(concepts.slug, slug)).limit(1);
    if (!row) {
      res.status(404).json({ error: "concept not found" });
      return;
    }
    sendCached(res, req, {
      slug:             row.slug,
      title:            row.title,
      emoji:            row.emoji,
      category:         row.category,
      tagline:          row.tagline,
      sections:         row.sections,
      related:          row.related,
      roadmapKeywords:  row.roadmapKeywords,
    }, { maxAge: 3600, swr: 86400 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load concept" });
  }
});

export default router;
