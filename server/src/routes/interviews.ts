// ── Interview Q&A routes ──────────────────────────────────────────────────────
import { Router } from "express";
import { db, cached } from "../db/client.js";
import { interviewQuestions, answerDocs, users } from "../db/schema.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { writeLimiter, userWriteLimiter } from "../middleware/rateLimiter.js";
import { sendCached } from "../middleware/cache.js";
import { queryCache } from "../lib/cache.js";
import { interviewSubmitSchema, answerDocSubmitSchema } from "../lib/schemas.js";

const router = Router();


// GET /api/interviews
router.get("/", async (req, res) => {
  try {
    const { category, difficulty, company, sort = "newest", page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset   = (pageNum - 1) * limitNum;

    const cacheKey = `interviews:${category ?? ""}:${difficulty ?? ""}:${company ?? ""}:${sort}:${pageNum}:${limitNum}`;

    const data = await cached(cacheKey, async () => {
      const conditions = [eq(interviewQuestions.isApproved, true)];
      if (category)   conditions.push(eq(interviewQuestions.category, category));
      if (difficulty) conditions.push(eq(interviewQuestions.difficulty, difficulty));
      if (company)    conditions.push(sql`${company} = ANY(${interviewQuestions.companies})`);

      const orderCols =
        sort === "newest" ? [desc(interviewQuestions.createdAt), desc(interviewQuestions.id)] :
        sort === "alpha"  ? [asc(interviewQuestions.title),      desc(interviewQuestions.id)] :
        [asc(sql`CASE ${interviewQuestions.difficulty} WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END`), desc(interviewQuestions.id)];

      const questions = await db
        .select()
        .from(interviewQuestions)
        .where(and(...conditions))
        .orderBy(...orderCols)
        .limit(limitNum)
        .offset(offset);

      const qIds = questions.map((q) => q.id);
      const answers = qIds.length
        ? await db
            .select({
              questionId:  answerDocs.questionId,
              id:          answerDocs.id,
              label:       answerDocs.label,
              url:         answerDocs.url,
              createdAt:   answerDocs.createdAt,
              displayName: users.displayName,
              github:      users.github,
            })
            .from(answerDocs)
            .leftJoin(users, eq(answerDocs.submittedBy, users.id))
            .where(eq(answerDocs.isApproved, true))
        : [];

      const answersByQ = new Map<string, typeof answers>();
      for (const a of answers) {
        if (!qIds.includes(a.questionId)) continue;
        const arr = answersByQ.get(a.questionId) ?? [];
        arr.push(a);
        answersByQ.set(a.questionId, arr);
      }

      return questions.map((q) => ({
        id:         q.id,
        category:   q.category,
        title:      q.title,
        difficulty: q.difficulty,
        companies:  q.companies,
        topics:     q.topics,
        hints:      q.hints,
        followUps:  q.followUps,
        createdAt:  q.createdAt,
        answerDocs: (answersByQ.get(q.id) ?? []).map((a) => ({
          id:      a.id,
          label:   a.label,
          url:     a.url,
          by:      a.displayName ?? "Maintainer",
          github:  a.github,
          createdAt: a.createdAt,
        })),
      }));
    });

    sendCached(res, req, { data, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// POST /api/interviews/submit — auth-required community submission
router.post("/submit", requireAuth, writeLimiter, userWriteLimiter, async (req, res) => {
  const parsed = interviewSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" });
    return;
  }
  const { category, title, difficulty, companies, topics, hints, followUps } = parsed.data;

  try {
    await db.insert(interviewQuestions).values({
      category, title, difficulty, companies, topics, hints,
      followUps,
      isApproved: false,
      submittedBy: req.user!.id,
    });
    queryCache.invalidate("interviews:");
    queryCache.invalidate("bootstrap:");
    res.status(201).json({ message: "Question submitted — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit question" });
  }
});

// POST /api/interviews/:id/answers — submit a community answer doc (auth required)
router.post("/:id/answers", requireAuth, writeLimiter, userWriteLimiter, async (req, res) => {
  const questionId = req.params.id;
  if (!questionId) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = answerDocSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid submission" });
    return;
  }
  const { label, url } = parsed.data;

  try {
    await db.insert(answerDocs).values({
      questionId, label, url,
      isApproved: false,
      submittedBy: req.user!.id,
    });
    queryCache.invalidate("interviews:");
    queryCache.invalidate("bootstrap:");
    res.status(201).json({ message: "Answer submitted — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// PATCH /api/interviews/:id/approve — admin
router.patch("/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await db
      .update(interviewQuestions)
      .set({ isApproved: true })
      .where(eq(interviewQuestions.id, id))
      .returning({ id: interviewQuestions.id });
    if (!updated) { res.status(404).json({ error: "Not found" }); return; }
    queryCache.invalidate("interviews:");
    res.json({ approved: true, id: updated.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

export default router;
