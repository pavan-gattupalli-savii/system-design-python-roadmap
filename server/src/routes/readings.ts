// ── Readings routes ────────────────────────────────────────────────────────────
import { Router } from "express";
import { sql } from "../db/client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// GET /api/readings
// Query params: type, difficulty, topic, sort (top|newest|alpha), page, limit
router.get("/", async (req, res) => {
  try {
    const { type, difficulty, topic, sort = "top", page = "1", limit = "50" } = req.query as Record<string, string>;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    let rows = await sql`
      SELECT * FROM readings
      WHERE is_approved = true
        AND (${type || null} IS NULL OR type = ${type || ""})
        AND (${difficulty || null} IS NULL OR difficulty = ${difficulty || ""})
        AND (${topic || null} IS NULL OR ${topic || ""} = ANY(topics))
      ORDER BY
        CASE WHEN ${sort} = 'top'    THEN upvotes END DESC,
        CASE WHEN ${sort} = 'newest' THEN added_on END DESC,
        CASE WHEN ${sort} = 'alpha'  THEN title   END ASC,
        id DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    // Map snake_case DB columns → camelCase for frontend compatibility
    const data = rows.map((r) => ({
      id:         r.id,
      type:       r.type,
      title:      r.title,
      url:        r.url,
      addedBy:    r.added_by,
      githubUser: r.github_user ?? undefined,
      topics:     r.topics,
      difficulty: r.difficulty ?? undefined,
      upvotes:    r.upvotes,
      addedOn:    r.added_on,
      notes:      r.notes ?? undefined,
    }));

    res.json({ data, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

// POST /api/readings/submit — community submission (lands as is_approved=false)
router.post("/submit", writeLimiter, async (req, res) => {
  try {
    const { type, title, url, addedBy, githubUser, topics, difficulty, notes } = req.body as {
      type: string; title: string; url: string; addedBy: string;
      githubUser?: string; topics: string[]; difficulty?: string; notes?: string;
    };

    if (!type || !title || !url || !addedBy || !Array.isArray(topics)) {
      res.status(400).json({ error: "Missing required fields: type, title, url, addedBy, topics" });
      return;
    }

    // Sanitise URL — must be https
    if (!url.startsWith("https://")) {
      res.status(400).json({ error: "URL must start with https://" });
      return;
    }

    await sql`
      INSERT INTO readings (type, title, url, added_by, github_user, topics, difficulty, notes, upvotes, added_on, is_approved)
      VALUES (${type}, ${title}, ${url}, ${addedBy}, ${githubUser ?? null}, ${topics}, ${difficulty ?? null}, ${notes ?? null}, 0, NOW()::DATE, false)
    `;

    res.status(201).json({ message: "Submission received — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit reading" });
  }
});

// POST /api/readings/:id/upvote — increment upvote count
router.post("/:id/upvote", writeLimiter, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const rows = await sql`
      UPDATE readings SET upvotes = upvotes + 1
      WHERE id = ${id} AND is_approved = true
      RETURNING upvotes
    ` as { upvotes: number }[];

    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ upvotes: rows[0].upvotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upvote" });
  }
});

// PATCH /api/readings/:id/approve — admin only
router.patch("/:id/approve", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await sql`
      UPDATE readings SET is_approved = true WHERE id = ${id} RETURNING id
    ` as { id: number }[];
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ approved: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

export default router;
