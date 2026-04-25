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


export async function buildRoadmap(language: "python" | "java"): Promise<unknown[]> {
  const cached = roadmapCache.get(language);
  if (cached) return cached as unknown[];

  // Fetch all 4 tables filtered by language, then join in memory
  const phases = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, language)).orderBy(asc(roadmapPhases.phaseNumber));
  const phaseIds = phases.map((p) => p.id);
  if (!phaseIds.length) { roadmapCache.set(language, []); return []; }

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

  const data = phases.map((p) => ({
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

  roadmapCache.set(language, data);
  return data;
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
