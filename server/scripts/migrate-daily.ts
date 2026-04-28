// ── Add daily_completions table ────────────────────────────────────────────────
// Run once: npm run migrate:daily
// Safe to re-run: uses IF NOT EXISTS.

import { sql } from "../src/db/client.js";

async function migrate() {
  console.log("▶ Adding daily_completions table…");

  await sql`
    CREATE TABLE IF NOT EXISTS daily_completions (
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic_date   TEXT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, topic_date)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_daily_completions_user
    ON daily_completions(user_id, topic_date DESC)
  `;

  console.log("  ✓ daily_completions");
  console.log("✅ Done");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
