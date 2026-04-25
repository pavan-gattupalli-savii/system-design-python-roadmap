// ── Roadmap routes ────────────────────────────────────────────────────────────
// Returns the full nested Phase[] structure needed by the frontend,
// reconstructed from the relational DB tables using JSON aggregation.
// Result is cached in memory for 5 minutes to avoid repeated heavy joins.

import { Router } from "express";
import { sql } from "../db/client.js";

const router = Router();

// In-memory cache keyed by language
const cache: Record<string, { data: unknown; expiresAt: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// GET /api/roadmap/:language  (language = "python" | "java")
router.get("/:language", async (req, res) => {
  const { language } = req.params;

  if (language !== "python" && language !== "java") {
    res.status(400).json({ error: "language must be 'python' or 'java'" });
    return;
  }

  // Serve from cache if valid
  const cached = cache[language];
  if (cached && cached.expiresAt > Date.now()) {
    res.json(cached.data);
    return;
  }

  try {
    // Fetch all resources for the language in one query (flat), then reconstruct
    const rows = await sql`
      SELECT
        rp.id          AS phase_id,
        rp.phase_number,
        rp.title       AS phase_title,
        rp.icon        AS phase_icon,
        rp.accent,
        rp.light,
        rp.description AS phase_desc,
        rw.id          AS week_id,
        rw.week_number,
        rw.title       AS week_title,
        rs.id          AS session_id,
        rs.label       AS session_label,
        rs.focus       AS session_focus,
        rs.sort_order  AS session_order,
        rr.id          AS resource_id,
        rr.type        AS resource_type,
        rr.item        AS resource_item,
        rr.where_text,
        rr.mins,
        rr.url         AS resource_url,
        rr.sort_order  AS resource_order
      FROM roadmap_phases rp
      JOIN roadmap_weeks    rw ON rw.phase_id   = rp.id
      JOIN roadmap_sessions rs ON rs.week_id    = rw.id
      JOIN roadmap_resources rr ON rr.session_id = rs.id
      WHERE rp.language = ${language}
      ORDER BY rp.phase_number, rw.week_number, rs.sort_order, rr.sort_order
    `;

    if (!rows.length) {
      res.status(404).json({ error: "No roadmap data found for " + language });
      return;
    }

    // Reconstruct nested structure Phase[] → Week[] → Session[] → Resource[]
    const phaseMap = new Map<number, {
      phase: number; title: string; icon: string; accent: string; light: string; desc: string;
      weeks: Map<number, { n: number; title: string; sessions: Map<number, { label: string; focus: string; sortOrder: number; resources: unknown[] }> }>;
    }>();

    for (const row of rows) {
      if (!phaseMap.has(row.phase_id)) {
        phaseMap.set(row.phase_id, {
          phase: row.phase_number,
          title: row.phase_title,
          icon:  row.phase_icon,
          accent: row.accent,
          light:  row.light,
          desc:   row.phase_desc,
          weeks:  new Map(),
        });
      }
      const phase = phaseMap.get(row.phase_id)!;

      if (!phase.weeks.has(row.week_id)) {
        phase.weeks.set(row.week_id, {
          n:        row.week_number,
          title:    row.week_title,
          sessions: new Map(),
        });
      }
      const week = phase.weeks.get(row.week_id)!;

      if (!week.sessions.has(row.session_id)) {
        week.sessions.set(row.session_id, {
          label:     row.session_label,
          focus:     row.session_focus,
          sortOrder: row.session_order,
          resources: [],
        });
      }
      const session = week.sessions.get(row.session_id)!;

      session.resources.push({
        type:  row.resource_type,
        item:  row.resource_item,
        where: row.where_text,
        mins:  row.mins,
        url:   row.resource_url ?? undefined,
      });
    }

    // Flatten maps to arrays in the shape the frontend expects
    const data = Array.from(phaseMap.values()).map((p) => ({
      phase:  p.phase,
      title:  p.title,
      icon:   p.icon,
      accent: p.accent,
      light:  p.light,
      desc:   p.desc,
      weeks: Array.from(p.weeks.values()).map((w) => ({
        n:     w.n,
        title: w.title,
        sessions: Array.from(w.sessions.values())
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((s) => ({
            label:     s.label,
            focus:     s.focus,
            resources: s.resources,
          })),
      })),
    }));

    // Cache result
    cache[language] = { data, expiresAt: Date.now() + CACHE_TTL_MS };

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

export default router;
