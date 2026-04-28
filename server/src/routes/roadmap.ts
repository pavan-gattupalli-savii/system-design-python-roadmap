// ── Roadmap routes ────────────────────────────────────────────────────────────
// Returns the full nested Phase[] structure needed by the frontend,
// reconstructed from the relational DB tables using JSON aggregation.

import { Router } from "express";
import { db } from "../db/client.js";
import { roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { roadmapCache } from "../lib/cache.js";
import { sendCached } from "../middleware/cache.js";

const router = Router();


async function fetchFromDB(language: "python" | "java"): Promise<unknown[]> {
  const phases = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, language)).orderBy(asc(roadmapPhases.phaseNumber));
  if (!phases.length) return [];

  const [weeks, sessions, resources] = await Promise.all([
    db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber)),
    db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder)),
    db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder)),
  ]);

  const weeksByPhase = new Map<number, typeof weeks>();
  for (const w of weeks) {
    const arr = weeksByPhase.get(w.phaseId) ?? [];
    arr.push(w);
    weeksByPhase.set(w.phaseId, arr);
  }
  const sessionsByWeek = new Map<number, typeof sessions>();
  for (const s of sessions) {
    const arr = sessionsByWeek.get(s.weekId) ?? [];
    arr.push(s);
    sessionsByWeek.set(s.weekId, arr);
  }
  const resourcesBySession = new Map<number, typeof resources>();
  for (const r of resources) {
    const arr = resourcesBySession.get(r.sessionId) ?? [];
    arr.push(r);
    resourcesBySession.set(r.sessionId, arr);
  }

  return phases.map((p) => ({
    phase:  p.phaseNumber,
    title:  p.title,
    icon:   p.icon,
    accent: p.accent,
    light:  p.light,
    desc:   p.description,
    weeks: (weeksByPhase.get(p.id) ?? []).map((w) => ({
      n:     w.weekNumber,
      title: w.title,
      sessions: (sessionsByWeek.get(w.id) ?? []).map((s) => ({
        label:     s.label,
        focus:     s.focus,
        resources: (resourcesBySession.get(s.id) ?? []).map((r) => ({
          type:  r.type,
          item:  r.item,
          where: r.whereText,
          mins:  r.mins,
          url:   r.url ?? undefined,
        })),
      })),
    })),
  }));
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
    sendCached(res, req, data, { maxAge: 300, swr: 600 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

export default router;
