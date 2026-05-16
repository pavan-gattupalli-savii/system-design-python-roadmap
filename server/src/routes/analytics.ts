// ── Analytics routes ──────────────────────────────────────────────────────────
// Per-user roadmap progress metrics. All numbers derived from user_progress +
// roadmap_resources joins; no separate aggregates table needed yet.
//
// GET /api/me/analytics?lang=python — returns:
//   {
//     totals:        { done, total, pct },
//     mins:          { done, total, remaining },
//     byType:        { Article: { done, total, mins }, ... },
//     byPhase:       [{ phase, title, done, total, pct, mins }, ...],
//     velocity:      { last7d, last30d },           // resources/day
//     predictedDays: number | null,                  // remaining/(last7d/7)
//     streak:        number,                         // consecutive days with ≥1 completion
//     lastCompletedAt: ISOString | null,
//   }

import { Router } from "express";
import { db, sql } from "../db/client.js";
import { userProgress, roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources, buildSpecs } from "../db/schema.js";
import { eq, asc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { buildMaps, flattenResources } from "../lib/roadmapTree.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const lang = req.query.lang === "java" ? "java" : "python";
  const userId = req.user!.id;
  try {
    // 1. Roadmap shape — fetched + assembled by the shared roadmapTree helper.
    const phases    = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, lang)).orderBy(asc(roadmapPhases.phaseNumber));
    const [weeks, sessions, resources, specs] = await Promise.all([
      db.select().from(roadmapWeeks),
      db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder)),
      db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder)),
      db.select().from(buildSpecs).where(eq(buildSpecs.language, lang)),
    ]);

    const maps = buildMaps(weeks, sessions, resources, specs);
    const flat = flattenResources(phases, maps);

    // 3. Pull completion rows + the completed_at timestamps for velocity/streak.
    const progressRows = await db.select({
      resourceKey: userProgress.resourceKey,
      completedAt: userProgress.completedAt,
    })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.language, lang)));

    const doneSet = new Set(progressRows.map((r) => r.resourceKey));
    const completedDates = progressRows.map((r) => new Date(r.completedAt as unknown as string));

    // 4. Aggregates
    let doneCount = 0, totalCount = 0;
    let doneMins = 0,  totalMins  = 0;
    let doneHours = 0, totalHours = 0;
    const byType: Record<string, { done: number; total: number; mins: number }> = {};
    const byPhase: Record<number, { phase: number; title: string; done: number; total: number; mins: number; totalMins: number; hours: number; totalHours: number }> = {};

    for (const f of flat) {
      totalCount++;
      totalMins += f.mins;
      const hours = f.estHours;
      totalHours += hours;
      byType[f.type] ??= { done: 0, total: 0, mins: 0 };
      byType[f.type].total++;
      byPhase[f.phase] ??= { phase: f.phase, title: f.phaseTitle, done: 0, total: 0, mins: 0, totalMins: 0, hours: 0, totalHours: 0 };
      byPhase[f.phase].total++;
      byPhase[f.phase].totalMins += f.mins;
      byPhase[f.phase].totalHours += hours;
      if (doneSet.has(f.key)) {
        doneCount++;
        doneMins += f.mins;
        doneHours += hours;
        byType[f.type].done++;
        byType[f.type].mins += f.mins;
        byPhase[f.phase].done++;
        byPhase[f.phase].mins += f.mins;
        byPhase[f.phase].hours += hours;
      }
    }

    // 5. Velocity: distinct-day completions in last 7/30 days.
    const now = Date.now();
    const ms7  = 7  * 24 * 60 * 60 * 1000;
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const last7  = completedDates.filter((d) => now - d.getTime() < ms7).length;
    const last30 = completedDates.filter((d) => now - d.getTime() < ms30).length;

    const perDay = last7 / 7;
    const remaining = totalCount - doneCount;
    const predictedDays = perDay > 0 ? Math.ceil(remaining / perDay) : null;

    // 6. Streak: consecutive UTC days ending today with ≥1 completion.
    const dayStrs = new Set(completedDates.map((d) => d.toISOString().slice(0, 10)));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      if (dayStrs.has(key)) streak++;
      else if (i === 0)     continue;   // grace: today may not have a completion yet
      else                  break;
    }

    const lastCompletedAt = completedDates.length
      ? completedDates.reduce((m, d) => (d > m ? d : m), new Date(0)).toISOString()
      : null;

    // Convert byPhase to a sorted array
    const byPhaseArr = Object.values(byPhase)
      .sort((a, b) => a.phase - b.phase)
      .map((p) => ({
        ...p,
        pct: p.total ? Math.round((p.done / p.total) * 100) : 0,
      }));

    res.json({
      totals: {
        done:  doneCount,
        total: totalCount,
        pct:   totalCount ? Math.round((doneCount / totalCount) * 100) : 0,
      },
      mins:  { done: doneMins,  total: totalMins,  remaining: totalMins  - doneMins  },
      hours: { done: doneHours, total: totalHours, remaining: totalHours - doneHours },
      byType,
      byPhase: byPhaseArr,
      velocity: { last7d: last7, last30d: last30, perDay7: perDay },
      predictedDays,
      streak,
      lastCompletedAt,
    });
    // touch sql import so it's not tree-shaken from helper scripts
    void sql;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});

export default router;
