// ── Roadmap routes ────────────────────────────────────────────────────────────
// Returns the full nested Phase[] structure needed by the frontend,
// reconstructed from the relational DB tables using JSON aggregation.

import { Router } from "express";
import { db } from "../db/client.js";
import { roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources, buildSpecs } from "../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { roadmapCache } from "../lib/cache.js";
import { sendCached } from "../middleware/cache.js";

const router = Router();

// Same `resId` the frontend uses — keep in sync (src/utils/stats.ts).
function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

async function fetchFromDB(language: "python" | "java"): Promise<unknown[]> {
  const phases = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, language)).orderBy(asc(roadmapPhases.phaseNumber));
  if (!phases.length) return [];

  const [weeks, sessions, resources, specs] = await Promise.all([
    db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber)),
    db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder)),
    db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder)),
    db.select().from(buildSpecs).where(eq(buildSpecs.language, language)),
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
  const specByKey = new Map(specs.map((s) => [s.resourceKey, s]));

  return phases.map((p) => ({
    phase:    p.phaseNumber,
    title:    p.title,
    icon:     p.icon,
    accent:   p.accent,
    light:    p.light,
    desc:     p.description,
    outcomes: p.outcomes ?? [],
    weeks: (weeksByPhase.get(p.id) ?? []).map((w) => ({
      n:                  w.weekNumber,
      title:              w.title,
      learningObjectives: w.learningObjectives ?? [],
      sessions: (sessionsByWeek.get(w.id) ?? []).map((s, si) => ({
        label:     s.label,
        focus:     s.focus,
        resources: (resourcesBySession.get(s.id) ?? []).map((r, ri) => {
          const key = resId(p.phaseNumber, w.weekNumber, si, ri);
          const spec = r.type === "Build" ? specByKey.get(key) : undefined;
          return {
            type:   r.type,
            item:   r.item,
            where:  r.whereText,
            mins:   r.mins,
            url:    r.url ?? undefined,
            isCore: r.isCore,
            spec:   spec ? {
              overview:     spec.overview,
              requirements: spec.requirements,
              acceptance:   spec.acceptance,
              diagram:      spec.diagram ?? undefined,
              hints:        spec.hints,
              difficulty:   spec.difficulty,
            } : undefined,
          };
        }),
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
    sendCached(res, req, data, { maxAge: 3600, swr: 86400 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

export default router;
