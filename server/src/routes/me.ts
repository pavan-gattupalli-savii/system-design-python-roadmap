// ── Current-user routes ───────────────────────────────────────────────────────
// Profile read/write + per-user roadmap progress. Identity now lives in the
// `users` table (managed by /api/auth) — this router just exposes the slice
// the UI needs plus the published/pending content counts.

import { Router } from "express";
import { db } from "../db/client.js";
import {
  users, userProgress, readingUpvotes, experienceUpvotes, userPracticedQuestions,
  readings, interviewQuestions, experiences, answerDocs,
} from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";
import { profileUpdateSchema, progressUpdateSchema, practiceToggleSchema } from "../lib/schemas.js";

const router = Router();


router.use(requireAuth);

// GET /api/me — current profile + published-content metrics.
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;

    const [u] = await db
      .select({
        id:          users.id,
        email:       users.email,
        displayName: users.displayName,
        github:      users.github,
        linkedin:    users.linkedin,
        role:        users.role,
        createdAt:   users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!u) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Multi-count queries using parallel Drizzle count queries
    const [
      [pubReadings], [pubInterviews], [pubExperiences], [pubAnswers],
      [pendReadings], [pendInterviews], [pendExperiences], [pendAnswers],
    ] = await Promise.all([
      db.select({ c: count() }).from(readings).where(and(eq(readings.submittedBy, userId), eq(readings.isApproved, true))),
      db.select({ c: count() }).from(interviewQuestions).where(and(eq(interviewQuestions.submittedBy, userId), eq(interviewQuestions.isApproved, true))),
      db.select({ c: count() }).from(experiences).where(and(eq(experiences.submittedBy, userId), eq(experiences.isApproved, true))),
      db.select({ c: count() }).from(answerDocs).where(and(eq(answerDocs.submittedBy, userId), eq(answerDocs.isApproved, true))),
      db.select({ c: count() }).from(readings).where(and(eq(readings.submittedBy, userId), eq(readings.isApproved, false))),
      db.select({ c: count() }).from(interviewQuestions).where(and(eq(interviewQuestions.submittedBy, userId), eq(interviewQuestions.isApproved, false))),
      db.select({ c: count() }).from(experiences).where(and(eq(experiences.submittedBy, userId), eq(experiences.isApproved, false))),
      db.select({ c: count() }).from(answerDocs).where(and(eq(answerDocs.submittedBy, userId), eq(answerDocs.isApproved, false))),
    ]);

    res.json({
      id:          u.id,
      email:       u.email,
      displayName: u.displayName,
      github:      u.github,
      linkedin:    u.linkedin,
      role:        u.role,
      createdAt:   u.createdAt,
      published: { readings: pubReadings.c, interviews: pubInterviews.c, experiences: pubExperiences.c, answers: pubAnswers.c },
      pending:   { readings: pendReadings.c, interviews: pendInterviews.c, experiences: pendExperiences.c, answers: pendAnswers.c },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// PATCH /api/me — update display_name / github / linkedin
router.patch("/", writeLimiter, async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid update" });
    return;
  }

  try {
    const userId = req.user!.id;
    const { displayName, github, linkedin } = parsed.data;

    // Only include fields explicitly provided; undefined → Drizzle omits from SET
    const patch: Partial<typeof users.$inferInsert> = {};
    if (displayName !== undefined && displayName !== null) patch.displayName = displayName;
    patch.github   = github   === undefined ? undefined : (github   === "" ? null : github);
    patch.linkedin = linkedin === undefined ? undefined : (linkedin === "" ? null : linkedin);

    await db.update(users).set(patch).where(eq(users.id, userId));
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/me/progress?lang=python
router.get("/progress", async (req, res) => {
  const lang = req.query.lang === "java" ? "java" : "python";
  try {
    const rows = await db
      .select({ resourceKey: userProgress.resourceKey })
      .from(userProgress)
      .where(and(eq(userProgress.userId, req.user!.id), eq(userProgress.language, lang)));
    res.json({ language: lang, completed: rows.map((r) => r.resourceKey) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

// POST /api/me/progress — toggle a single resource
router.post("/progress", writeLimiter, async (req, res) => {
  const parsed = progressUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid update" });
    return;
  }
  const { language, resourceKey, done } = parsed.data;
  const userId = req.user!.id;
  try {
    if (done) {
      await db.insert(userProgress)
        .values({ userId, language, resourceKey })
        .onConflictDoNothing();
    } else {
      await db.delete(userProgress).where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.language, language),
          eq(userProgress.resourceKey, resourceKey),
        ),
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

// DELETE /api/me/progress?lang=python — wipe all progress for a language
router.delete("/progress", writeLimiter, async (req, res) => {
  const lang = req.query.lang === "java" ? "java" : "python";
  try {
    await db.delete(userProgress).where(
      and(eq(userProgress.userId, req.user!.id), eq(userProgress.language, lang)),
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset progress" });
  }
});

// GET /api/me/upvotes — every reading + experience this user has upvoted.
router.get("/upvotes", async (req, res) => {
  try {
    const userId = req.user!.id;
    const [readingRows, expRows] = await Promise.all([
      db.select({ readingId: readingUpvotes.readingId })
        .from(readingUpvotes)
        .where(eq(readingUpvotes.userId, userId)),
      db.select({ experienceId: experienceUpvotes.experienceId })
        .from(experienceUpvotes)
        .where(eq(experienceUpvotes.userId, userId)),
    ]);
    res.json({
      readings:    readingRows.map((r) => r.readingId),
      experiences: expRows.map((r) => r.experienceId),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load upvotes" });
  }
});

// GET /api/me/practiced — IDs of every Q&A entry this user has ticked.
router.get("/practiced", async (req, res) => {
  try {
    const rows = await db
      .select({ questionId: userPracticedQuestions.questionId })
      .from(userPracticedQuestions)
      .where(eq(userPracticedQuestions.userId, req.user!.id));
    res.json(rows.map((r) => r.questionId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load practiced list" });
  }
});

// POST /api/me/practiced — { questionId, done }: insert or delete.
router.post("/practiced", writeLimiter, async (req, res) => {
  const parsed = practiceToggleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid update" });
    return;
  }
  const { questionId, done } = parsed.data;
  const userId = req.user!.id;
  try {
    if (done) {
      await db.insert(userPracticedQuestions)
        .values({ userId, questionId })
        .onConflictDoNothing();
    } else {
      await db.delete(userPracticedQuestions).where(
        and(
          eq(userPracticedQuestions.userId, userId),
          eq(userPracticedQuestions.questionId, questionId),
        ),
      );
    }
    res.json({ ok: true, questionId, practiced: done });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update practiced list" });
  }
});

export default router;
