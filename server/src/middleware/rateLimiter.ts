// ── Rate limiter middleware ────────────────────────────────────────────────────
import rateLimit from "express-rate-limit";

/** 100 req/min for reads */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — slow down." },
});

/** 10 req/min for community submissions */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions — please wait a moment." },
});
