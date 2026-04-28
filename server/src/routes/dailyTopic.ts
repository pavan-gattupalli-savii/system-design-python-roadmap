// ── Daily Topic routes ─────────────────────────────────────────────────────────
// GET  /api/daily-topic          → today's topic + user's streak & completion
// POST /api/daily-topic/complete → mark today's topic as read (auth required)
//
// Topic selection is deterministic: we build a stable pool of items (roadmap
// sessions ordered by phase/week/sortOrder, then approved readings ordered by
// createdAt) and pick index = Math.floor(Date.now() / 86_400_000) % pool.length.
// Same topic all day, rotates automatically — zero admin curation needed.

import { Router } from "express";
import { dailyPoolCache } from "../lib/cache.js";
import { db } from "../db/client.js";
import {
  roadmapPhases, roadmapWeeks, roadmapSessions,
  readings, dailyCompletions,
} from "../db/schema.js";
import { eq, asc, desc, and } from "drizzle-orm";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** UTC date string "YYYY-MM-DD" for a given timestamp (default: now). */
function utcDateStr(ts: number = Date.now()): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Day-index (floored UTC days since epoch). Stable within a calendar day. */
function todayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

/** Compute streak for a user. Returns 0 if they have no completions. */
function computeStreak(sortedDates: string[]): number {
  if (!sortedDates.length) return 0;
  // sortedDates is DESC (most recent first, each "YYYY-MM-DD")
  let streak = 0;
  let expected = todayIndex();
  // Allow streak to count even if today is not done yet (extend from yesterday)
  const mostRecentDay = Math.floor(new Date(sortedDates[0] + "T00:00:00Z").getTime() / 86_400_000);
  if (mostRecentDay < expected - 1) return 0; // last completion was 2+ days ago — streak broken
  if (mostRecentDay === expected - 1) expected = expected - 1; // start from yesterday

  for (const d of sortedDates) {
    const day = Math.floor(new Date(d + "T00:00:00Z").getTime() / 86_400_000);
    if (day === expected) {
      streak++;
      expected--;
    } else if (day < expected) {
      break; // gap — streak ends
    }
    // day > expected shouldn't happen (DESC sorted), skip
  }
  return streak;
}

// ── Pool builder ──────────────────────────────────────────────────────────────

interface PoolItem {
  sourceType:  "session" | "reading";
  title:       string;
  description: string;
  url?:        string;
  mins?:       number;
  tags:        string[];
  phase?:      number;
  phaseTitle?: string;
  weekNum?:    number;
  weekTitle?:  string;
}

async function buildPool(): Promise<PoolItem[]> {
  // 1. Roadmap sessions — ordered by phase → week → session sortOrder
  const phases   = await db.select().from(roadmapPhases).orderBy(asc(roadmapPhases.phaseNumber));
  const weeks    = await db.select().from(roadmapWeeks).orderBy(asc(roadmapWeeks.weekNumber));
  const sessions = await db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder));

  const phaseMap = new Map(phases.map((p) => [p.id, p]));
  const weekMap  = new Map(weeks.map((w) => [w.id, w]));

  // Build phase order for week sorting
  const phaseOrder = new Map(phases.map((p) => [p.id, p.phaseNumber]));

  // Sort weeks by (phaseOrder, weekNumber) for stable global ordering
  const sortedWeeks = [...weeks].sort((a, b) => {
    const pa = phaseOrder.get(a.phaseId) ?? 0;
    const pb = phaseOrder.get(b.phaseId) ?? 0;
    if (pa !== pb) return pa - pb;
    return a.weekNumber - b.weekNumber;
  });

  const weekOrder = new Map(sortedWeeks.map((w, i) => [w.id, i]));

  // Sort sessions by (weekOrder, sortOrder)
  const sortedSessions = [...sessions].sort((a, b) => {
    const wa = weekOrder.get(a.weekId) ?? 0;
    const wb = weekOrder.get(b.weekId) ?? 0;
    if (wa !== wb) return wa - wb;
    return a.sortOrder - b.sortOrder;
  });

  const sessionItems: PoolItem[] = sortedSessions.map((s) => {
    const w = weekMap.get(s.weekId);
    const p = w ? phaseMap.get(w.phaseId) : undefined;
    return {
      sourceType:  "session",
      title:       s.focus,
      description: s.label,
      tags:        p ? [p.title] : [],
      phase:       p?.phaseNumber,
      phaseTitle:  p?.title,
      weekNum:     w?.weekNumber,
      weekTitle:   w?.title,
    };
  });

  // 2. Approved community readings — ordered by createdAt ASC for stability
  const readingRows = await db
    .select({
      title:     readings.title,
      url:       readings.url,
      topics:    readings.topics,
      notes:     readings.notes,
      createdAt: readings.createdAt,
    })
    .from(readings)
    .where(eq(readings.isApproved, true))
    .orderBy(asc(readings.createdAt));

  const readingItems: PoolItem[] = readingRows.map((r) => ({
    sourceType:  "reading",
    title:       r.title,
    description: r.notes ?? "",
    url:         r.url,
    tags:        r.topics,
  }));

  return [...sessionItems, ...readingItems];
}

// ── GET /api/daily-topic ──────────────────────────────────────────────────────

router.get("/", optionalAuth, async (req, res) => {
  try {
    // Pool is identical for all users all day — cache it keyed by UTC date.
    // First request of the day pays the 4-query DB cost; all subsequent hits
    // (including UptimeRobot pings every 5 min) are served from memory.
    const pool = (await dailyPoolCache.load(
      "pool:" + utcDateStr(),
      buildPool as () => Promise<unknown>,
    )).data as PoolItem[];

    if (!pool.length) {
      res.status(503).json({ error: "No topics available yet" });
      return;
    }

    const idx   = todayIndex() % pool.length;
    const topic = pool[idx];
    const today = utcDateStr();

    let completed = false;
    let streak    = 0;

    if (req.user) {
      const userId = req.user.id;

      // Check today's completion + fetch all dates for streak
      const rows = await db
        .select({ topicDate: dailyCompletions.topicDate })
        .from(dailyCompletions)
        .where(eq(dailyCompletions.userId, userId))
        .orderBy(desc(dailyCompletions.topicDate));

      const dates = rows.map((r) => r.topicDate);
      completed   = dates[0] === today;
      streak      = computeStreak(dates);
    }

    res.json({
      ...topic,
      completed,
      streak,
      todayDate: today,
      poolSize:  pool.length,
    });
  } catch (err) {
    console.error("[daily-topic GET]", err);
    res.status(500).json({ error: "Failed to fetch daily topic" });
  }
});

// ── POST /api/daily-topic/complete ────────────────────────────────────────────

router.post("/complete", requireAuth, writeLimiter, async (req, res) => {
  try {
    const userId = req.user!.id;
    const today  = utcDateStr();

    await db
      .insert(dailyCompletions)
      .values({ userId, topicDate: today })
      .onConflictDoNothing();

    // Re-compute streak
    const rows = await db
      .select({ topicDate: dailyCompletions.topicDate })
      .from(dailyCompletions)
      .where(eq(dailyCompletions.userId, userId))
      .orderBy(desc(dailyCompletions.topicDate));

    const streak = computeStreak(rows.map((r) => r.topicDate));

    res.json({ ok: true, completed: true, streak });
  } catch (err) {
    console.error("[daily-topic POST]", err);
    res.status(500).json({ error: "Failed to record completion" });
  }
});

// ── GET /api/daily-topic/history?days=30 ──────────────────────────────────────
// Returns an array of "YYYY-MM-DD" strings the user has completed — used by
// the history grid on DailyTopicPage. Auth required.

router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const days   = Math.min(365, Math.max(7, parseInt((req.query.days as string) ?? "30")));

    const cutoff = utcDateStr(Date.now() - days * 86_400_000);

    const rows = await db
      .select({ topicDate: dailyCompletions.topicDate })
      .from(dailyCompletions)
      .where(and(
        eq(dailyCompletions.userId, userId),
      ))
      .orderBy(asc(dailyCompletions.topicDate));

    const dates = rows.map((r) => r.topicDate).filter((d) => d >= cutoff);

    res.json({ dates });
  } catch (err) {
    console.error("[daily-topic history]", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
