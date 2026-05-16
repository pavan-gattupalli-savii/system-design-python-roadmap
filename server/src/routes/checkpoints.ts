// ── Phase checkpoint routes ───────────────────────────────────────────────────
// Quiz questions per phase + per-user pass tracking.
// Questions: anonymously readable. Attempts: require auth.

import { Router } from "express";
import { db } from "../db/client.js";
import { phaseCheckpoints, userCheckpointAttempts } from "../db/schema.js";
import { eq, and, asc, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// GET /api/checkpoints/:language/me — per-user pass status (auth required).
// Declared BEFORE /:language/:phase so "me" isn't matched as a phase number.
router.get("/:language/me", requireAuth, async (req, res) => {
  const lang = req.params.language === "java" ? "java" : "python";
  try {
    const rows = await db
      .select({
        phaseNumber: phaseCheckpoints.phaseNumber,
        id:          phaseCheckpoints.id,
        passed:      userCheckpointAttempts.passed,
      })
      .from(phaseCheckpoints)
      .leftJoin(
        userCheckpointAttempts,
        and(
          eq(userCheckpointAttempts.checkpointId, phaseCheckpoints.id),
          eq(userCheckpointAttempts.userId, req.user!.id),
        ),
      )
      .where(eq(phaseCheckpoints.language, lang))
      .orderBy(asc(phaseCheckpoints.phaseNumber), asc(phaseCheckpoints.sortOrder));

    const byPhase: Record<number, { total: number; passed: number }> = {};
    for (const r of rows) {
      byPhase[r.phaseNumber] ??= { total: 0, passed: 0 };
      byPhase[r.phaseNumber].total++;
      if (r.passed === true) byPhase[r.phaseNumber].passed++;
    }
    res.json(byPhase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load checkpoint status" });
  }
});

// GET /api/checkpoints/:language/:phase — public, omits answer_idx
router.get("/:language/:phase", async (req, res) => {
  const lang = req.params.language === "java" ? "java" : "python";
  const phase = parseInt(req.params.phase, 10);
  if (!Number.isFinite(phase)) {
    res.status(400).json({ error: "phase must be a number" });
    return;
  }
  try {
    const rows = await db
      .select({
        id:       phaseCheckpoints.id,
        question: phaseCheckpoints.question,
        options:  phaseCheckpoints.options,
      })
      .from(phaseCheckpoints)
      .where(and(eq(phaseCheckpoints.language, lang), eq(phaseCheckpoints.phaseNumber, phase)))
      .orderBy(asc(phaseCheckpoints.sortOrder));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load checkpoints" });
  }
});

const submitSchema = z.object({
  answers: z.array(z.object({
    id:      z.number().int().positive(),
    answer:  z.number().int().min(0).max(20),
  })).min(1).max(50),
});

// POST /api/checkpoints/:language/:phase/submit — graded, requires auth
router.post("/:language/:phase/submit", requireAuth, writeLimiter, async (req, res) => {
  const lang = req.params.language === "java" ? "java" : "python";
  const phase = parseInt(req.params.phase, 10);
  if (!Number.isFinite(phase)) {
    res.status(400).json({ error: "phase must be a number" });
    return;
  }
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" });
    return;
  }

  const userId = req.user!.id;
  const ids = parsed.data.answers.map((a) => a.id);
  try {
    const checkpoints = await db
      .select({ id: phaseCheckpoints.id, answerIdx: phaseCheckpoints.answerIdx, explanation: phaseCheckpoints.explanation })
      .from(phaseCheckpoints)
      .where(and(
        eq(phaseCheckpoints.language, lang),
        eq(phaseCheckpoints.phaseNumber, phase),
        inArray(phaseCheckpoints.id, ids),
      ));

    const byId = new Map(checkpoints.map((c) => [c.id, c]));
    const results = parsed.data.answers.map((a) => {
      const c = byId.get(a.id);
      if (!c) return { id: a.id, correct: false, expected: null, explanation: "" };
      return { id: a.id, correct: a.answer === c.answerIdx, expected: c.answerIdx, explanation: c.explanation };
    });

    // Persist pass/fail per checkpoint (upsert)
    for (const r of results) {
      if (r.expected === null) continue;
      await db.insert(userCheckpointAttempts)
        .values({ userId, checkpointId: r.id, passed: r.correct })
        .onConflictDoUpdate({
          target: [userCheckpointAttempts.userId, userCheckpointAttempts.checkpointId],
          set: { passed: r.correct, attemptedAt: new Date() },
        });
    }

    const correct = results.filter((r) => r.correct).length;
    res.json({
      total:   results.length,
      correct,
      passed:  correct === results.length,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit checkpoint" });
  }
});

export default router;
