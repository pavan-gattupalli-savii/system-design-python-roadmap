// ── Admin routes ──────────────────────────────────────────────────────────────
// Approval queue + reject. All routes require an admin role on the users table.

import { Router } from "express";
import { db } from "../db/client.js";
import { readings, interviewQuestions, experiences, answerDocs, users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { queryCache } from "../lib/cache.js";
import { adminKindSchema } from "../lib/schemas.js";

const router = Router();

router.use(requireAuth, requireAdmin);


// GET /api/admin/pending — everything awaiting review, grouped by kind.
router.get("/pending", async (_req, res) => {
  try {
    const submitterAlias = { submitterName: users.displayName, submitterEmail: users.email };

    const [pendingReadings, pendingInterviews, pendingExperiences, pendingAnswers] = await Promise.all([
      db.select({
        id: readings.id, type: readings.type, title: readings.title, url: readings.url,
        topics: readings.topics, difficulty: readings.difficulty, notes: readings.notes,
        submittedBy: readings.submittedBy, createdAt: readings.createdAt,
        ...submitterAlias,
      }).from(readings).leftJoin(users, eq(readings.submittedBy, users.id))
        .where(eq(readings.isApproved, false)).orderBy(desc(readings.createdAt)).limit(200),

      db.select({
        id: interviewQuestions.id, category: interviewQuestions.category,
        title: interviewQuestions.title, difficulty: interviewQuestions.difficulty,
        companies: interviewQuestions.companies, topics: interviewQuestions.topics,
        hints: interviewQuestions.hints, followUps: interviewQuestions.followUps,
        submittedBy: interviewQuestions.submittedBy, createdAt: interviewQuestions.createdAt,
        ...submitterAlias,
      }).from(interviewQuestions).leftJoin(users, eq(interviewQuestions.submittedBy, users.id))
        .where(eq(interviewQuestions.isApproved, false)).orderBy(desc(interviewQuestions.createdAt)).limit(200),

      db.select({
        id: experiences.id, title: experiences.title, url: experiences.url,
        platform: experiences.platform, company: experiences.company, role: experiences.role,
        outcome: experiences.outcome, topics: experiences.topics, notes: experiences.notes,
        submittedBy: experiences.submittedBy, createdAt: experiences.createdAt,
        ...submitterAlias,
      }).from(experiences).leftJoin(users, eq(experiences.submittedBy, users.id))
        .where(eq(experiences.isApproved, false)).orderBy(desc(experiences.createdAt)).limit(200),

      db.select({
        id: answerDocs.id, questionId: answerDocs.questionId, label: answerDocs.label,
        url: answerDocs.url, submittedBy: answerDocs.submittedBy, createdAt: answerDocs.createdAt,
        ...submitterAlias,
      }).from(answerDocs).leftJoin(users, eq(answerDocs.submittedBy, users.id))
        .where(eq(answerDocs.isApproved, false)).orderBy(desc(answerDocs.createdAt)).limit(200),
    ]);

    const chip = (name: string | null | undefined, email: string | null | undefined) =>
      name?.trim() || email || "anonymous";

    res.json({
      readings:    pendingReadings.map((r) => ({ ...r, addedBy: chip(r.submitterName, r.submitterEmail) })),
      interviews:  pendingInterviews.map((q) => ({ ...q, addedBy: chip(q.submitterName, q.submitterEmail) })),
      experiences: pendingExperiences.map((e) => ({ ...e, addedBy: chip(e.submitterName, e.submitterEmail) })),
      answers:     pendingAnswers.map((a) => ({ ...a, by: chip(a.submitterName, a.submitterEmail) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load queue" });
  }
});

// PATCH /api/admin/:kind/:id/approve
router.patch("/:kind/:id/approve", async (req, res) => {
  const parsed = adminKindSchema.safeParse(req.params.kind);
  if (!parsed.success) { res.status(400).json({ error: "Invalid kind" }); return; }
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const kind = parsed.data;
    let row: { id: number } | undefined;
    if (kind === "readings") {
      [row] = await db.update(readings).set({ isApproved: true }).where(eq(readings.id, id)).returning({ id: readings.id });
    } else if (kind === "interviews") {
      [row] = await db.update(interviewQuestions).set({ isApproved: true }).where(eq(interviewQuestions.id, id)).returning({ id: interviewQuestions.id });
    } else if (kind === "experiences") {
      [row] = await db.update(experiences).set({ isApproved: true }).where(eq(experiences.id, id)).returning({ id: experiences.id });
    } else {
      [row] = await db.update(answerDocs).set({ isApproved: true }).where(eq(answerDocs.id, id)).returning({ id: answerDocs.id });
    }
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate(kind + ":");
    queryCache.invalidate("bootstrap:");
    res.json({ approved: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

// DELETE /api/admin/:kind/:id — reject (deletes the row).
router.delete("/:kind/:id", async (req, res) => {
  const parsed = adminKindSchema.safeParse(req.params.kind);
  if (!parsed.success) { res.status(400).json({ error: "Invalid kind" }); return; }
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const kind = parsed.data;
    let row: { id: number } | undefined;
    if (kind === "readings") {
      [row] = await db.delete(readings).where(eq(readings.id, id)).returning({ id: readings.id });
    } else if (kind === "interviews") {
      [row] = await db.delete(interviewQuestions).where(eq(interviewQuestions.id, id)).returning({ id: interviewQuestions.id });
    } else if (kind === "experiences") {
      [row] = await db.delete(experiences).where(eq(experiences.id, id)).returning({ id: experiences.id });
    } else {
      [row] = await db.delete(answerDocs).where(eq(answerDocs.id, id)).returning({ id: answerDocs.id });
    }
    if (!row) { res.status(404).json({ error: "Not found or already approved" }); return; }
    res.json({ rejected: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject" });
  }
});

export default router;
