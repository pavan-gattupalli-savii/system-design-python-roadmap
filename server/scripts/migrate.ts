// ── Database schema migration ─────────────────────────────────────────────────
// Run once: npm run migrate
// Safe to re-run: all statements use IF NOT EXISTS / DO NOTHING.

import { sql } from "../src/db/client.js";

async function migrate() {
  console.log("▶ Running migrations…");

  // ── Extensions ────────────────────────────────────────────────────────────
  // citext = case-insensitive text. We use it for emails so "X@Y" == "x@y" at
  // the DB level — no need to remember to .toLowerCase() in every query.
  await sql`CREATE EXTENSION IF NOT EXISTS citext`;
  console.log("  ✓ extension: citext");

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

  // ── App users (in-house, owned by us) ────────────────────────────────────
  // Identity now lives entirely in this table. `email_verified_at` is set the
  // first time a user successfully completes the OTP flow.
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email             CITEXT UNIQUE NOT NULL,
      email_verified_at TIMESTAMPTZ,
      display_name      TEXT NOT NULL DEFAULT '',
      github            TEXT,
      linkedin          TEXT,
      role              TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at     TIMESTAMPTZ
    )
  `;
  console.log("  ✓ users");

  // ── Email OTPs ────────────────────────────────────────────────────────────
  // One in-flight OTP per email. The `code_hash` column stores sha256(code) so
  // a DB leak doesn't expose live login codes. Refreshed on every request-otp.
  await sql`
    CREATE TABLE IF NOT EXISTS email_otps (
      email        CITEXT PRIMARY KEY,
      code_hash    TEXT NOT NULL,
      expires_at   TIMESTAMPTZ NOT NULL,
      attempts     INT NOT NULL DEFAULT 0,
      last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("  ✓ email_otps");

  // ── Migration: drop the old Stack Auth `user_profiles` table ─────────────
  // Safe to call on a fresh DB (DROP IF EXISTS is a no-op).
  // CASCADE removes the now-stale FK from `user_progress`.
  await sql`DROP TABLE IF EXISTS user_profiles CASCADE`;
  console.log("  ✓ dropped legacy user_profiles");

  // ── Per-user roadmap progress (FK now points at our users table) ─────────
  await sql`
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      language     TEXT NOT NULL CHECK (language IN ('python','java')),
      resource_key TEXT NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, language, resource_key)
    )
  `;
  console.log("  ✓ user_progress");

  // ── Authoring trail on every community-submission table ──────────────────
  await sql`ALTER TABLE readings              ADD COLUMN IF NOT EXISTS submitted_by UUID`;
  await sql`ALTER TABLE interview_questions   ADD COLUMN IF NOT EXISTS submitted_by UUID`;
  await sql`ALTER TABLE experiences           ADD COLUMN IF NOT EXISTS submitted_by UUID`;
  await sql`ALTER TABLE answer_docs           ADD COLUMN IF NOT EXISTS submitted_by UUID`;
  console.log("  ✓ submitted_by columns");

  // ── Drop NOT NULL on legacy attribution columns ──────────────────────────
  // Identity now comes from users joined via submitted_by; new rows leave the
  // legacy columns NULL. Old seed rows keep their values for back-compat.
  await sql`ALTER TABLE readings    ALTER COLUMN added_by    DROP NOT NULL`;
  await sql`ALTER TABLE experiences ALTER COLUMN added_by    DROP NOT NULL`;
  await sql`ALTER TABLE answer_docs ALTER COLUMN by          DROP NOT NULL`;
  console.log("  ✓ legacy attribution columns made nullable");

  // ── Per-user reading upvotes ─────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS reading_upvotes (
      user_id    UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
      reading_id INT  NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, reading_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_reading_upvotes_reading ON reading_upvotes(reading_id)`;
  console.log("  ✓ reading_upvotes");

  // ── Per-user experience upvotes ──────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS experience_upvotes (
      user_id       UUID NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
      experience_id INT  NOT NULL REFERENCES experiences(id)  ON DELETE CASCADE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, experience_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_experience_upvotes_exp ON experience_upvotes(experience_id)`;
  console.log("  ✓ experience_upvotes");

  // ── Per-user practiced questions ─────────────────────────────────────────
  // Replaces the old "sd_practiced_v1" key in localStorage so the tick mark
  // follows the user across devices instead of dying with their browser cache.
  await sql`
    CREATE TABLE IF NOT EXISTS user_practiced_questions (
      user_id      UUID NOT NULL REFERENCES users(id)               ON DELETE CASCADE,
      question_id  INT  NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
      practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, question_id)
    )
  `;
  console.log("  ✓ user_practiced_questions");

  // ── Indexes ───────────────────────────────────────────────────────────────
  await sql`CREATE INDEX IF NOT EXISTS idx_readings_approved     ON readings(is_approved)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_iq_approved           ON interview_questions(is_approved)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_exp_approved          ON experiences(is_approved)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_rphase_lang           ON roadmap_phases(language)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rweeks_phase_id       ON roadmap_weeks(phase_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rsessions_week_id     ON roadmap_sessions(week_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_rresources_session_id ON roadmap_resources(session_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_readings_upvotes      ON readings(upvotes DESC) WHERE is_approved = true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_exp_upvotes           ON experiences(upvotes DESC) WHERE is_approved = true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_answer_docs_qid       ON answer_docs(question_id)`;

  await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_user_lang ON user_progress(user_id, language)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_readings_submitted_by   ON readings(submitted_by) WHERE submitted_by IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_iq_submitted_by         ON interview_questions(submitted_by) WHERE submitted_by IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_exp_submitted_by        ON experiences(submitted_by) WHERE submitted_by IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_answer_docs_submitted_by ON answer_docs(submitted_by) WHERE submitted_by IS NOT NULL`;

  console.log("✅ Migration complete");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
