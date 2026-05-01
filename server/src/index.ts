// ── Express app entry point ────────────────────────────────────────────────────
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { readLimiter } from "./middleware/rateLimiter.js";
import { timingLogger, requestTimeout } from "./middleware/cache.js";
import readingsRouter    from "./routes/readings.js";
import interviewsRouter  from "./routes/interviews.js";
import experiencesRouter from "./routes/experiences.js";
import roadmapRouter, { buildRoadmap } from "./routes/roadmap.js";
import bootstrapRouter   from "./routes/bootstrap.js";
import meRouter          from "./routes/me.js";
import adminRouter       from "./routes/admin.js";
import authRouter        from "./routes/auth.js";
import dailyTopicRouter  from "./routes/dailyTopic.js";
import bookmarksRouter   from "./routes/bookmarks.js";
import buildsRouter      from "./routes/builds.js";


const app = express();
const PORT = parseInt(process.env.PORT ?? "3001");

// Hide framework version + trust the reverse proxy in front of us.
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.set("etag", false);  // we generate strong ETags ourselves in sendCached

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,                       // we serve a JSON API, not HTML
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy:   { policy: "same-origin-allow-popups" },
  referrerPolicy:            { policy: "no-referrer" },
}));

// ── Compression + access log + per-request timing ────────────────────────────
app.use(compression());
app.use(morgan("tiny", {
  skip: (req) => req.url === "/health",  // don't spam logs with health checks
}));
app.use(timingLogger);
// Belt-and-suspenders: any request that hasn't responded in 15s gets a 503.
// Stops a slow Neon cold-start from leaving the browser tab spinning.
app.use(requestTimeout(15_000));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origin not allowed — " + origin));
    }
  },
  credentials: true,                                  // sd_session cookie crosses origins
  methods:        ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "X-Admin-Key", "Authorization"],
  maxAge: 600,
}));

// ── Body + cookie parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRouter);   // own rate limits per route
app.use("/api/bootstrap",   readLimiter, bootstrapRouter);
app.use("/api/readings",    readLimiter, readingsRouter);
app.use("/api/interviews",  readLimiter, interviewsRouter);
app.use("/api/experiences", readLimiter, experiencesRouter);
app.use("/api/roadmap",     readLimiter, roadmapRouter);
app.use("/api/me",          readLimiter, meRouter);
app.use("/api/admin",       readLimiter, adminRouter);
app.use("/api/daily-topic", readLimiter, dailyTopicRouter);
app.use("/api/bookmarks",   bookmarksRouter);   // auth handled inside router
app.use("/api/builds",     buildsRouter);       // auth required inside router

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Prevent crashes from unhandled rejections / exceptions ───────────────────
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

// ── Boot-time warmup ──────────────────────────────────────────────────────────
// Best-effort: poke the DB, build the roadmap for both languages, AND pre-fill
// the readings/interviews/experiences hot-list caches so the very first user
// request never pays the Neon cold-start tax.
//
// We import the same `cached` helper the routes use so warmup populates the
// exact cache keys the GET handlers will hit.
import { db, cached } from "./db/client.js";
import { readings, interviewQuestions, experiences, answerDocs, users } from "./db/schema.js";
import { eq, desc, asc, sql } from "drizzle-orm";

async function warmup(): Promise<void> {
  const t0 = Date.now();
  try {
    // Ping DB
    await db.select({ one: sql<number>`1` }).from(users).limit(1);

    // Pre-build both language roadmaps + the three default list views
    await Promise.all([
      buildRoadmap("python"),
      buildRoadmap("java"),

      cached("readings::::top:1:200", async () => {
        const rows = await db
          .select({
            id: readings.id, type: readings.type, title: readings.title, url: readings.url,
            displayName: users.displayName, github: users.github,
            topics: readings.topics, difficulty: readings.difficulty,
            upvotes: readings.upvotes, createdAt: readings.createdAt, notes: readings.notes,
          })
          .from(readings)
          .leftJoin(users, eq(readings.submittedBy, users.id))
          .where(eq(readings.isApproved, true))
          .orderBy(desc(readings.upvotes), desc(readings.id))
          .limit(200);
        return rows.map((r) => ({
          id: r.id, type: r.type, title: r.title, url: r.url,
          addedBy: r.displayName ?? "Maintainer", githubUser: r.github ?? undefined,
          topics: r.topics, difficulty: r.difficulty ?? undefined,
          upvotes: r.upvotes, createdAt: r.createdAt, notes: r.notes ?? undefined,
        }));
      }),

      cached("interviews::::difficulty:1:50", async () => {
        const questions = await db
          .select()
          .from(interviewQuestions)
          .where(eq(interviewQuestions.isApproved, true))
          .orderBy(
            asc(sql`CASE ${interviewQuestions.difficulty} WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END`),
            desc(interviewQuestions.id),
          )
          .limit(50);

        const qIds = questions.map((q) => q.id);
        const answers = qIds.length
          ? await db
              .select({ questionId: answerDocs.questionId, id: answerDocs.id, label: answerDocs.label, url: answerDocs.url, createdAt: answerDocs.createdAt, displayName: users.displayName, github: users.github })
              .from(answerDocs)
              .leftJoin(users, eq(answerDocs.submittedBy, users.id))
              .where(eq(answerDocs.isApproved, true))
          : [];

        const byQ = new Map<string, typeof answers>();
        for (const a of answers) {
          if (!qIds.includes(a.questionId)) continue;
          const arr = byQ.get(a.questionId) ?? [];
          arr.push(a);
          byQ.set(a.questionId, arr);
        }

        return questions.map((q) => ({
          id: q.id, category: q.category, title: q.title, difficulty: q.difficulty,
          companies: q.companies, topics: q.topics, hints: q.hints,
          followUps: q.followUps, createdAt: q.createdAt,
          answerDocs: (byQ.get(q.id) ?? []).map((a) => ({ id: a.id, label: a.label, url: a.url, by: a.displayName ?? "Maintainer", github: a.github, createdAt: a.createdAt })),
        }));
      }),

      cached("experiences::::top:1:50", async () => {
        const rows = await db
          .select({
            id: experiences.id, title: experiences.title, url: experiences.url,
            platform: experiences.platform, company: experiences.company, role: experiences.role,
            outcome: experiences.outcome, topics: experiences.topics, notes: experiences.notes,
            upvotes: experiences.upvotes, createdAt: experiences.createdAt,
            displayName: users.displayName, github: users.github,
          })
          .from(experiences)
          .leftJoin(users, eq(experiences.submittedBy, users.id))
          .where(eq(experiences.isApproved, true))
          .orderBy(desc(experiences.upvotes), desc(experiences.id))
          .limit(50);
        return rows.map((e) => ({
          id: e.id, title: e.title, url: e.url, platform: e.platform,
          company: e.company, role: e.role, outcome: e.outcome ?? undefined,
          topics: e.topics, notes: e.notes ?? undefined, upvotes: e.upvotes,
          addedBy: e.displayName ?? "Maintainer", githubUser: e.github ?? undefined,
          createdAt: e.createdAt,
        }));
      }),
    ]);

    console.log(`🔥 Warmup complete in ${Date.now() - t0}ms (DB + roadmap + hot lists primed)`);
  } catch (err) {
    console.warn("⚠ Warmup failed (will retry lazily):", err);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set — DB queries will fail with 500");
}
if (!process.env.JWT_SECRET) {
  console.warn("⚠ JWT_SECRET is not set — auth-required endpoints will reject every token");
}
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("⚠ SMTP_* env vars are not fully set — OTPs will be logged to stdout instead of emailed");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API server running on port ${PORT}`);
  void warmup();
});
