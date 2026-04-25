// ── Rate limiter middleware ────────────────────────────────────────────────────
import rateLimit from "express-rate-limit";
import type { Request } from "express";

/** 100 req/min for reads */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — slow down." },
});

/** 10 req/min/IP for community submissions */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions — please wait a moment." },
});

/**
 * 30 writes per hour per *authenticated user*. Stacks on top of writeLimiter
 * so a single attacker can't burn through their quota by rotating IPs.
 * Falls back to IP if no user is attached (e.g. mounted on an open route).
 */
export const userWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? "anon",
  message: { error: "You've hit the hourly submission limit — try again later." },
});

/** 3 OTP requests / hour / IP — backstop against email-spam. */
export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts from this network. Try again later." },
});

/** 10 verify attempts / 10 min / IP — limits brute-forcing the 6-digit code. */
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many code attempts. Try again in a few minutes." },
});
