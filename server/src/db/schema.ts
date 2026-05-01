// ── Drizzle ORM schema ─────────────────────────────────────────────────────────
// Mirrors the PostgreSQL tables created in scripts/migrate.ts.
// Column names use camelCase here; the actual DB column names are in snake_case
// (passed as the first argument to each column helper).

import {
  pgTable, serial, text, integer, boolean, timestamp, uuid,
  primaryKey, customType, uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// citext — case-insensitive text (requires the citext Postgres extension)
const citext = customType<{ data: string; driverData: string }>({
  dataType() { return "citext"; },
});

// ── Community: Readings ──────────────────────────────────────────────────────
export const readings = pgTable("readings", {
  id:          uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  type:        text("type").notNull(),
  title:       text("title").notNull(),
  url:         text("url").notNull(),
  topics:      text("topics").array().notNull().default([]),
  difficulty:  text("difficulty"),
  upvotes:     integer("upvotes").notNull().default(0),
  notes:       text("notes"),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Community: Interview questions ───────────────────────────────────────────
export const interviewQuestions = pgTable("interview_questions", {
  id:          uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  category:    text("category").notNull(),
  title:       text("title").notNull(),
  difficulty:  text("difficulty").notNull(),
  companies:   text("companies").array().notNull().default([]),
  topics:      text("topics").array().notNull().default([]),
  hints:       text("hints").array().notNull().default([]),
  followUps:   text("follow_ups").array().notNull().default([]),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Community: Answer docs (linked to interview questions) ───────────────────
export const answerDocs = pgTable("answer_docs", {
  id:          uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  questionId:  uuid("question_id").notNull(),
  label:       text("label").notNull(),
  url:         text("url").notNull(),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Community: Interview experiences ────────────────────────────────────────
export const experiences = pgTable("experiences", {
  id:          uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  title:       text("title").notNull(),
  url:         text("url").notNull(),
  platform:    text("platform").notNull(),
  company:     text("company").notNull(),
  role:        text("role").notNull(),
  outcome:     text("outcome"),
  topics:      text("topics").array().notNull().default([]),
  notes:       text("notes"),
  upvotes:     integer("upvotes").notNull().default(0),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Roadmap: Phases ───────────────────────────────────────────────────────────
export const roadmapPhases = pgTable("roadmap_phases", {
  id:          serial("id").primaryKey(),
  language:    text("language").notNull(),
  phaseNumber: integer("phase_number").notNull(),
  title:       text("title").notNull(),
  icon:        text("icon").notNull().default(""),
  accent:      text("accent").notNull().default("#6366f1"),
  light:       text("light").notNull().default("#a5b4fc"),
  description: text("description").notNull().default(""),
});

// ── Roadmap: Weeks ────────────────────────────────────────────────────────────
export const roadmapWeeks = pgTable("roadmap_weeks", {
  id:         serial("id").primaryKey(),
  phaseId:    integer("phase_id").notNull(),
  weekNumber: integer("week_number").notNull(),
  title:      text("title").notNull(),
});

// ── Roadmap: Sessions ────────────────────────────────────────────────────────
export const roadmapSessions = pgTable("roadmap_sessions", {
  id:        serial("id").primaryKey(),
  weekId:    integer("week_id").notNull(),
  label:     text("label").notNull(),
  focus:     text("focus").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ── Roadmap: Resources ────────────────────────────────────────────────────────
export const roadmapResources = pgTable("roadmap_resources", {
  id:        serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  type:      text("type").notNull(),
  item:      text("item").notNull(),
  whereText: text("where_text").notNull().default(""),
  mins:      integer("mins").notNull().default(0),
  url:       text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:               uuid("id").primaryKey().defaultRandom(),
  email:            citext("email").notNull().unique(),
  emailVerifiedAt:  timestamp("email_verified_at", { withTimezone: true }),
  displayName:      text("display_name").notNull().default(""),
  github:           text("github"),
  linkedin:         text("linkedin"),
  role:             text("role").notNull().default("user"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt:      timestamp("last_login_at", { withTimezone: true }),
  passwordHash:     text("password_hash"),
});

// ── Email OTPs ────────────────────────────────────────────────────────────────
export const emailOtps = pgTable("email_otps", {
  email:      citext("email").primaryKey(),
  codeHash:   text("code_hash").notNull(),
  expiresAt:  timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts:   integer("attempts").notNull().default(0),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Per-user roadmap progress ─────────────────────────────────────────────────
export const userProgress = pgTable(
  "user_progress",
  {
    userId:      uuid("user_id").notNull(),
    language:    text("language").notNull(),
    resourceKey: text("resource_key").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.language, t.resourceKey] })],
);

// ── Per-user reading upvotes ──────────────────────────────────────────────────
export const readingUpvotes = pgTable(
  "reading_upvotes",
  {
    userId:    uuid("user_id").notNull(),
    readingId: uuid("reading_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.readingId] })],
);

// ── Per-user experience upvotes ───────────────────────────────────────────────
export const experienceUpvotes = pgTable(
  "experience_upvotes",
  {
    userId:       uuid("user_id").notNull(),
    experienceId: uuid("experience_id").notNull(),
    createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.experienceId] })],
);

// ── Per-user practiced questions ──────────────────────────────────────────────
export const userPracticedQuestions = pgTable(
  "user_practiced_questions",
  {
    userId:      uuid("user_id").notNull(),
    questionId:  uuid("question_id").notNull(),
    practicedAt: timestamp("practiced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

// ── Daily topic completions ────────────────────────────────────────────────────
// Records which UTC dates a user marked the daily topic as "read".
// `topicDate` is stored as "YYYY-MM-DD" text to avoid timezone edge cases.
export const dailyCompletions = pgTable(
  "daily_completions",
  {
    userId:      uuid("user_id").notNull(),
    topicDate:   text("topic_date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.topicDate] })],
);

// ── Build submissions ─────────────────────────────────────────────────────────
// One row per user per roadmap build resource. resourceKey = resId() string
// ("phase_weekN_si_ri"). Unique on (userId, language, resourceKey) — upsert.
export const buildSubmissions = pgTable(
  "build_submissions",
  {
    id:          uuid("id").primaryKey().defaultRandom(),
    userId:      uuid("user_id").notNull(),
    language:    text("language").notNull(),
    resourceKey: text("resource_key").notNull(),
    githubUrl:   text("github_url").notNull(),
    notes:       text("notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("build_submissions_user_lang_key").on(t.userId, t.language, t.resourceKey)],
);

// ── Per-user bookmarks ─────────────────────────────────────────────────────────
// Polymorphic: resourceType discriminates which table resourceId belongs to.
// resourceType: "reading" | "experience" | "question" | "roadmap_resource"
// resourceId: UUID for DB items; resId(phase,weekN,si,ri) string for roadmap resources.
export const bookmarks = pgTable(
  "bookmarks",
  {
    userId:       uuid("user_id").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId:   text("resource_id").notNull(),
    createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.resourceType, t.resourceId] })],
);
