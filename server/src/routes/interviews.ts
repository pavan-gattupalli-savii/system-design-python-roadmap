// ── Interview Q&A routes ──────────────────────────────────────────────────────
import { Router } from "express";
import { sql } from "../db/client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// GET /api/interviews
// Query params: category, difficulty, company, sort (difficulty|newest|alpha), page, limit
router.get("/", async (req, res) => {
  try {
    const { category, difficulty, company, sort = "difficulty", page = "1", limit = "50" } = req.query as Record<string, string>;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const rows = await sql`
      SELECT q.*, 
        COALESCE(
          json_agg(
            json_build_object('label', a.label, 'url', a.url, 'by', a.by, 'addedOn', a.added_on)
            ORDER BY a.created_at
          ) FILTER (WHERE a.id IS NOT NULL AND a.is_approved = true),
          '[]'
        ) AS answer_docs
      FROM interview_questions q
      LEFT JOIN answer_docs a ON a.question_id = q.id
      WHERE q.is_approved = true
        AND (${category || null} IS NULL OR q.category = ${category || ""})
        AND (${difficulty || null} IS NULL OR q.difficulty = ${difficulty || ""})
        AND (${company || null} IS NULL OR ${company || ""} = ANY(q.companies))
      GROUP BY q.id
      ORDER BY
        CASE WHEN ${sort} = 'difficulty' THEN
          CASE q.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 END
        END ASC,
        CASE WHEN ${sort} = 'newest' THEN q.added_on END DESC,
        CASE WHEN ${sort} = 'alpha'  THEN q.title   END ASC,
        q.id DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    const data = rows.map((q) => ({
      id:          q.id,
      category:    q.category,
      title:       q.title,
      difficulty:  q.difficulty,
      companies:   q.companies,
      topics:      q.topics,
      hints:       q.hints,
      followUps:   q.follow_ups,
      addedOn:     q.added_on,
      answerDocs:  q.answer_docs,
    }));

    res.json({ data, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// POST /api/interviews/submit — community question submission
router.post("/submit", writeLimiter, async (req, res) => {
  try {
    const { category, title, difficulty, companies, topics, hints, followUps } = req.body as {
      category: string; title: string; difficulty: string;
      companies: string[]; topics: string[]; hints: string[]; followUps?: string[];
    };

    if (!category || !title || !difficulty || !Array.isArray(hints) || hints.length === 0) {
      res.status(400).json({ error: "Missing required fields: category, title, difficulty, hints" });
      return;
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      res.status(400).json({ error: "difficulty must be Easy, Medium, or Hard" });
      return;
    }

    await sql`
      INSERT INTO interview_questions (category, title, difficulty, companies, topics, hints, follow_ups, added_on, is_approved)
      VALUES (${category}, ${title}, ${difficulty}, ${companies ?? []}, ${topics ?? []}, ${hints}, ${followUps ?? []}, NOW()::DATE, false)
    `;

    res.status(201).json({ message: "Question submitted — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit question" });
  }
});

// POST /api/interviews/:id/answers — submit a community answer doc
router.post("/:id/answers", writeLimiter, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const { label, url, by } = req.body as { label: string; url: string; by: string };
    if (!label || !url || !by) {
      res.status(400).json({ error: "Missing required fields: label, url, by" });
      return;
    }
    if (!url.startsWith("https://")) {
      res.status(400).json({ error: "URL must start with https://" });
      return;
    }

    await sql`
      INSERT INTO answer_docs (question_id, label, url, by, added_on, is_approved)
      VALUES (${questionId}, ${label}, ${url}, ${by}, NOW()::DATE, false)
    `;

    res.status(201).json({ message: "Answer submitted — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// PATCH /api/interviews/:id/approve — admin
router.patch("/:id/approve", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await sql`
      UPDATE interview_questions SET is_approved = true WHERE id = ${id} RETURNING id
    ` as { id: number }[];
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ approved: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

export default router;
