// Apply approved link-audit fixes:
//   1. readings.url: rewrite `eng.uber.com/...` → `www.uber.com/en-US/blog/...`
//   2. readings.is_approved=false for blog.bytebytego.com/p/* (5 rows)
//   3. answer_docs.is_approved=false for blog.bytebytego.com/p/* (4 rows)
//   4. experiences: hard-delete 5 LeetCode placeholder rows (no numeric IDs in URL)
//
// Dry-run support: pass --dry to print only.

import "dotenv/config";
import { sql } from "../src/db/client.js";

const dry = process.argv.includes("--dry");
const note = (s: string) => console.log(dry ? `[dry] ${s}` : `[ok]  ${s}`);

async function main() {
  // ── 1) Uber blog rewrite ──────────────────────────────────────────────────
  const uberRows = await sql`
    SELECT id, title, url FROM readings WHERE url ILIKE 'https://eng.uber.com/%'
  ` as unknown as Array<{ id: string; title: string; url: string }>;
  for (const r of uberRows) {
    const newUrl = r.url.replace("https://eng.uber.com/", "https://www.uber.com/en-US/blog/");
    note(`readings #${r.id.slice(0, 8)} url: ${r.url}  →  ${newUrl}`);
    if (!dry) {
      await sql`UPDATE readings SET url = ${newUrl} WHERE id = ${r.id}`;
    }
  }

  // ── 2) Unpublish CONFIRMED-broken readings (probed 404) ───────────────────
  // Hard-coded IDs from the probe run — pattern match was overbroad
  // because some blog.bytebytego.com/p/ URLs still work (e.g. message-queue).
  const READING_404_PREFIXES = [
    "d5eea684",  // consistent-hashing
    "28b86cec",  // rate-limiting-algorithms-explained
    "cd869508",  // understanding-database-indexes
    "e989e334",  // cap-theorem
    "9d2391fd",  // netflix-system-design
  ];
  const rdgRows = await sql`
    SELECT id, title, url FROM readings
    WHERE id::text LIKE ANY(${READING_404_PREFIXES.map((p) => p + "%")}) AND is_approved = true
  ` as unknown as Array<{ id: string; title: string; url: string }>;
  for (const r of rdgRows) {
    note(`readings #${r.id.slice(0, 8)} unpublish (404): ${r.title.slice(0, 50)}`);
  }
  if (!dry && rdgRows.length) {
    const ids = rdgRows.map((r) => r.id);
    await sql`UPDATE readings SET is_approved = false WHERE id = ANY(${ids})`;
  }

  // ── 3) Unpublish CONFIRMED-broken answer_docs ─────────────────────────────
  const AD_404_PREFIXES = [
    "7c88550e",  // design-a-url-shortener
    "2485e77e",  // rate-limiting-algorithms-explained
    "378ec5ae",  // design-a-notification-system
    "96af5291",  // design-a-key-value-store
  ];
  const adRows = await sql`
    SELECT id, label, url FROM answer_docs
    WHERE id::text LIKE ANY(${AD_404_PREFIXES.map((p) => p + "%")}) AND is_approved = true
  ` as unknown as Array<{ id: string; label: string; url: string }>;
  for (const r of adRows) {
    note(`answer_docs #${r.id.slice(0, 8)} unpublish (404): ${r.label.slice(0, 50)}`);
  }
  if (!dry && adRows.length) {
    const ids = adRows.map((r) => r.id);
    await sql`UPDATE answer_docs SET is_approved = false WHERE id = ANY(${ids})`;
  }

  // ── 4) Delete placeholder LeetCode experiences (no numeric ID in path) ────
  // Real LC discuss URLs: /discuss/interview-experience/<numericId>/<slug>
  // The 5 rows we found use /discuss/interview-experience/<slug> directly.
  const expRows = await sql`
    SELECT id, title, url FROM experiences
    WHERE url ~* '^https?://leetcode\.com/discuss/interview-experience/[a-z0-9-]+$'
  ` as unknown as Array<{ id: string; title: string; url: string }>;
  for (const r of expRows) {
    note(`experiences #${r.id.slice(0, 8)} DELETE (placeholder URL): ${r.title.slice(0, 50)}`);
  }
  if (!dry && expRows.length) {
    const ids = expRows.map((r) => r.id);
    await sql`DELETE FROM experiences WHERE id = ANY(${ids})`;
  }

  console.log("");
  console.log(`Summary: readings.rewrite=${uberRows.length}, readings.unpublish=${rdgRows.length}, answer_docs.unpublish=${adRows.length}, experiences.delete=${expRows.length}`);
  console.log(dry ? "(dry-run — no DB writes)" : "✓ applied");
}

main().catch((e) => { console.error(e); process.exit(1); });
