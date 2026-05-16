// ── Roadmap routes ────────────────────────────────────────────────────────────
// Returns the full nested Phase[] structure needed by the frontend,
// reconstructed from the relational DB tables using JSON aggregation.

import { Router } from "express";
import { db } from "../db/client.js";
import { roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources, buildSpecs } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { roadmapCache } from "../lib/cache.js";
import { sendCached } from "../middleware/cache.js";
import { buildMaps, serializePhases } from "../lib/roadmapTree.js";

const router = Router();

async function fetchFromDB(language: "python" | "java"): Promise<unknown[]> {
  const phases = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, language)).orderBy(asc(roadmapPhases.phaseNumber));
  if (!phases.length) return [];

  const [weeks, sessions, resources, specs] = await Promise.all([
    db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber)),
    db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder)),
    db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder)),
    db.select().from(buildSpecs).where(eq(buildSpecs.language, language)),
  ]);

  return serializePhases(phases, buildMaps(weeks, sessions, resources, specs));
}

// buildRoadmap: thin wrapper that adds SWR caching + in-flight dedup via roadmapCache.load().
// First request pays the DB cost; subsequent requests within 15min get a cached value instantly;
// stale entries (15–60min old) are served immediately while a background refresh runs.
export async function buildRoadmap(language: "python" | "java"): Promise<unknown[]> {
  const { data } = await roadmapCache.load(language, () => fetchFromDB(language));
  return data as unknown[];
}

// GET /api/roadmap/:language  (language = "python" | "java")
router.get("/:language", async (req, res) => {
  const { language } = req.params;
  if (language !== "python" && language !== "java") {
    res.status(400).json({ error: "language must be 'python' or 'java'" });
    return;
  }
  try {
    const data = await buildRoadmap(language);
    if (!data.length) {
      res.status(404).json({ error: "No roadmap data found for " + language });
      return;
    }
    sendCached(res, req, data, { maxAge: 3600, swr: 86400 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

export default router;
