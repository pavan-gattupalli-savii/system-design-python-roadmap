// ── Database schema migration ─────────────────────────────────────────────────
// Run once: npm run migrate
// Safe to re-run: all statements use IF NOT EXISTS / DO NOTHING.

import { sql } from "../src/db/client.js";

async function migrate() {
  console.log("▶ Running migrations…");

  // ── Community: Readings ──────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS readings (
      id            SERIAL PRIMARY KEY,
      type          TEXT NOT NULL,
      title         TEXT NOT NULL,
      url           TEXT NOT NULL,
      added_by      TEXT NOT NULL,
      github_user   TEXT,
      topics        TEXT[]    NOT NULL DEFAULT '{}',
      difficulty    TEXT      CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
      upvotes       INTEGER   NOT NULL DEFAULT 0,
      added_on      DATE      NOT NULL,
      notes         TEXT,
      is_approved   BOOLEAN   NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ readings");

  // ── Community: Interview questions ───────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS interview_questions (
      id            SERIAL PRIMARY KEY,
      category      TEXT NOT NULL,
      title         TEXT NOT NULL,
      difficulty    TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
      companies     TEXT[]    NOT NULL DEFAULT '{}',
      topics        TEXT[]    NOT NULL DEFAULT '{}',
      hints         TEXT[]    NOT NULL DEFAULT '{}',
      follow_ups    TEXT[]    NOT NULL DEFAULT '{}',
      added_on      DATE      NOT NULL,
      is_approved   BOOLEAN   NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ interview_questions");

  // ── Community: Answer docs (linked to questions) ─────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS answer_docs (
      id            SERIAL PRIMARY KEY,
      question_id   INTEGER   NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
      label         TEXT      NOT NULL,
      url           TEXT      NOT NULL,
      by            TEXT      NOT NULL,
      added_on      DATE      NOT NULL,
      is_approved   BOOLEAN   NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ answer_docs");

  // ── Community: Interview experiences ────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS experiences (
      id            SERIAL PRIMARY KEY,
      title         TEXT      NOT NULL,
      url           TEXT      NOT NULL,
      platform      TEXT      NOT NULL,
      company       TEXT      NOT NULL,
      role          TEXT      NOT NULL,
      outcome       TEXT      CHECK (outcome IN ('Offer','Rejected','Ongoing','Unknown')),
      topics        TEXT[]    NOT NULL DEFAULT '{}',
      notes         TEXT,
      upvotes       INTEGER   NOT NULL DEFAULT 0,
      added_by      TEXT      NOT NULL,
      github_user   TEXT,
      added_on      DATE      NOT NULL,
      is_approved   BOOLEAN   NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ experiences");

  // ── Roadmap: Phases ───────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS roadmap_phases (
      id            SERIAL PRIMARY KEY,
      language      TEXT      NOT NULL CHECK (language IN ('python','java')),
      phase_number  INTEGER   NOT NULL,
      title         TEXT      NOT NULL,
      icon          TEXT      NOT NULL DEFAULT '',
      accent        TEXT      NOT NULL DEFAULT '#6366f1',
      light         TEXT      NOT NULL DEFAULT '#a5b4fc',
      description   TEXT      NOT NULL DEFAULT '',
      UNIQUE (language, phase_number)
    )
  `;
  console.log("  ✓ roadmap_phases");

  // ── Roadmap: Weeks ────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS roadmap_weeks (
      id            SERIAL PRIMARY KEY,
      phase_id      INTEGER   NOT NULL REFERENCES roadmap_phases(id) ON DELETE CASCADE,
      week_number   INTEGER   NOT NULL,
      title         TEXT      NOT NULL,
      UNIQUE (phase_id, week_number)
    )
  `;
  console.log("  ✓ roadmap_weeks");

  // ── Roadmap: Sessions ────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS roadmap_sessions (
      id            SERIAL PRIMARY KEY,
      week_id       INTEGER   NOT NULL REFERENCES roadmap_weeks(id) ON DELETE CASCADE,
      label         TEXT      NOT NULL,
      focus         TEXT      NOT NULL,
      sort_order    INTEGER   NOT NULL DEFAULT 0
    )
  `;
  console.log("  ✓ roadmap_sessions");

  // ── Roadmap: Resources ────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS roadmap_resources (
      id            SERIAL PRIMARY KEY,
      session_id    INTEGER   NOT NULL REFERENCES roadmap_sessions(id) ON DELETE CASCADE,
      type          TEXT      NOT NULL,
      item          TEXT      NOT NULL,
      where_text    TEXT      NOT NULL DEFAULT '',
      mins          INTEGER   NOT NULL DEFAULT 0,
      url           TEXT,
      sort_order    INTEGER   NOT NULL DEFAULT 0
    )
  `;
  console.log("  ✓ roadmap_resources");

  // ── Indexes ───────────────────────────────────────────────────────────────
  await sql`CREATE INDEX IF NOT EXISTS idx_readings_approved  ON readings(is_approved)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_iq_approved        ON interview_questions(is_approved)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_exp_approved       ON experiences(is_approved)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rphase_lang        ON roadmap_phases(language)`;

  console.log("✅ Migration complete");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
