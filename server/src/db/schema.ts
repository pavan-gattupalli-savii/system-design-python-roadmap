// ── Drizzle ORM schema ─────────────────────────────────────────────────────────
// Mirrors the PostgreSQL tables created in scripts/migrate.ts.
// Column names use camelCase here; the actual DB column names are in snake_case
// (passed as the first argument to each column helper).

import {
  pgTable, serial, text, integer, boolean, date, timestamp, uuid,
  primaryKey, customType,
} from "drizzle-orm/pg-core";

// citext — case-insensitive text (requires the citext Postgres extension)
const citext = customType<{ data: string; driverData: string }>({
  dataType() { return "citext"; },
});

// ── Community: Readings ──────────────────────────────────────────────────────
export const readings = pgTable("readings", {
  id:          serial("id").primaryKey(),
  type:        text("type").notNull(),
  title:       text("title").notNull(),
  url:         text("url").notNull(),
  addedBy:     text("added_by"),
  githubUser:  text("github_user"),
  topics:      text("topics").array().notNull().default([]),
  difficulty:  text("difficulty"),
  upvotes:     integer("upvotes").notNull().default(0),
  addedOn:     date("added_on").notNull(),
  notes:       text("notes"),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Community: Interview questions ───────────────────────────────────────────
export const interviewQuestions = pgTable("interview_questions", {
  id:          serial("id").primaryKey(),
  category:    text("category").notNull(),
  title:       text("title").notNull(),
  difficulty:  text("difficulty").notNull(),
  companies:   text("companies").array().notNull().default([]),
  topics:      text("topics").array().notNull().default([]),
  hints:       text("hints").array().notNull().default([]),
  followUps:   text("follow_ups").array().notNull().default([]),
  addedOn:     date("added_on").notNull(),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Community: Answer docs (linked to interview questions) ───────────────────
export const answerDocs = pgTable("answer_docs", {
  id:          serial("id").primaryKey(),
  questionId:  integer("question_id").notNull(),
  label:       text("label").notNull(),
  url:         text("url").notNull(),
  by:          text("by"),
  addedOn:     date("added_on").notNull(),
  isApproved:  boolean("is_approved").notNull().default(true),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedBy: uuid("submitted_by"),
});

// ── Community: Interview experiences ────────────────────────────────────────
export const experiences = pgTable("experiences", {
  id:          serial("id").primaryKey(),
  title:       text("title").notNull(),
  url:         text("url").notNull(),
  platform:    text("platform").notNull(),
  company:     text("company").notNull(),
  role:        text("role").notNull(),
  outcome:     text("outcome"),
  topics:      text("topics").array().notNull().default([]),
  notes:       text("notes"),
  upvotes:     integer("upvotes").notNull().default(0),
  addedBy:     text("added_by"),
  githubUser:  text("github_user"),
  addedOn:     date("added_on").notNull(),
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
    readingId: integer("reading_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.readingId] })],
);

// ── Per-user experience upvotes ───────────────────────────────────────────────
export const experienceUpvotes = pgTable(
  "experience_upvotes",
  {
    userId:       uuid("user_id").notNull(),
    experienceId: integer("experience_id").notNull(),
    createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.experienceId] })],
);

// ── Per-user practiced questions ──────────────────────────────────────────────
export const userPracticedQuestions = pgTable(
  "user_practiced_questions",
  {
    userId:      uuid("user_id").notNull(),
    questionId:  integer("question_id").notNull(),
    practicedAt: timestamp("practiced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);
