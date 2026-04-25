// ── Experiences routes ────────────────────────────────────────────────────────
import { Router } from "express";
import { sql } from "../db/client.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// GET /api/experiences
// Query params: platform, company, outcome, sort (top|newest|alpha), page, limit
router.get("/", async (req, res) => {
  try {
    const { platform, company, outcome, sort = "top", page = "1", limit = "50" } = req.query as Record<string, string>;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const rows = await sql`
      SELECT * FROM experiences
      WHERE is_approved = true
        AND (${platform || null} IS NULL OR platform = ${platform || ""})
        AND (${company  || null} IS NULL OR company  = ${company  || ""})
        AND (${outcome  || null} IS NULL OR outcome  = ${outcome  || ""})
      ORDER BY
        CASE WHEN ${sort} = 'top'    THEN upvotes  END DESC,
        CASE WHEN ${sort} = 'newest' THEN added_on END DESC,
        CASE WHEN ${sort} = 'alpha'  THEN title    END ASC,
        id DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    const data = rows.map((e) => ({
      id:         e.id,
      title:      e.title,
      url:        e.url,
      platform:   e.platform,
      company:    e.company,
      role:       e.role,
      outcome:    e.outcome ?? undefined,
      topics:     e.topics,
      notes:      e.notes ?? undefined,
      upvotes:    e.upvotes,
      addedBy:    e.added_by,
      githubUser: e.github_user ?? undefined,
      addedOn:    e.added_on,
    }));

    res.json({ data, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

// POST /api/experiences/submit
router.post("/submit", writeLimiter, async (req, res) => {
  try {
    const { title, url, platform, company, role, outcome, topics, notes, addedBy, githubUser } = req.body as {
      title: string; url: string; platform: string; company: string; role: string;
      outcome?: string; topics: string[]; notes?: string; addedBy: string; githubUser?: string;
    };

    if (!title || !url || !platform || !company || !role || !addedBy) {
      res.status(400).json({ error: "Missing required fields: title, url, platform, company, role, addedBy" });
      return;
    }
    if (!url.startsWith("https://")) {
      res.status(400).json({ error: "URL must start with https://" });
      return;
    }

    await sql`
      INSERT INTO experiences (title, url, platform, company, role, outcome, topics, notes, upvotes, added_by, github_user, added_on, is_approved)
      VALUES (${title}, ${url}, ${platform}, ${company}, ${role}, ${outcome ?? null}, ${topics ?? []}, ${notes ?? null}, 0, ${addedBy}, ${githubUser ?? null}, NOW()::DATE, false)
    `;

    res.status(201).json({ message: "Experience submitted — pending review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit experience" });
  }
});

// POST /api/experiences/:id/upvote
router.post("/:id/upvote", writeLimiter, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const rows = await sql`
      UPDATE experiences SET upvotes = upvotes + 1
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

// PATCH /api/experiences/:id/approve — admin
router.patch("/:id/approve", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await sql`
      UPDATE experiences SET is_approved = true WHERE id = ${id} RETURNING id
    ` as { id: number }[];
    if (!rows.length) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ approved: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve" });
  }
});

export default router;
