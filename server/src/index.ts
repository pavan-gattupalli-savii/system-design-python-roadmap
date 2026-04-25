// ── Express app entry point ────────────────────────────────────────────────────
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { readLimiter } from "./middleware/rateLimiter.js";
import readingsRouter from "./routes/readings.js";
import interviewsRouter from "./routes/interviews.js";
import experiencesRouter from "./routes/experiences.js";
import roadmapRouter from "./routes/roadmap.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001");

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) in dev
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origin not allowed — " + origin));
    }
  },
  methods: ["GET", "POST", "PATCH"],
  allowedHeaders: ["Content-Type", "X-Admin-Key"],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "32kb" }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/readings",     readLimiter, readingsRouter);
app.use("/api/interviews",   readLimiter, interviewsRouter);
app.use("/api/experiences",  readLimiter, experiencesRouter);
app.use("/api/roadmap",      readLimiter, roadmapRouter);

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

// ── Start ─────────────────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set — DB queries will fail with 500");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API server running on port ${PORT}`);
});
