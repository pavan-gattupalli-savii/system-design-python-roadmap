// ── Auth routes ───────────────────────────────────────────────────────────────
// Password-based auth (register + login) plus legacy OTP routes (parked).
//   1. POST /register  { email, password, displayName? } → session cookie
//   2. POST /login     { email, password }               → session cookie
//   3. POST /logout                                      → clear cookie
//   4. GET  /me                                          → 200 user | 401

import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../db/client.js";
import { users, emailOtps } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { sendOtpEmail } from "../lib/mailer.js";
import {
  signSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "../lib/jwt.js";
import { requestOtpSchema, verifyOtpSchema, registerSchema, loginSchema } from "../lib/schemas.js";
import {
  otpRequestLimiter,
  otpVerifyLimiter,
  writeLimiter,
} from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const BCRYPT_ROUNDS = 12;

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", writeLimiter, async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { email, password, displayName } = parsed.data;

  try {
    // Check if email already exists
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists. Please sign in." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const [created] = await db.insert(users).values({
      email,
      passwordHash,
      displayName: displayName ?? email.split("@")[0] ?? "Member",
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    }).returning({ id: users.id, role: users.role });

    const token = signSession({ sub: created.id, role: created.role as "user" | "admin" });
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.status(201).json({ ok: true, token });
  } catch (err) {
    console.error("register failed:", err);
    res.status(500).json({ error: "Registration failed. Try again shortly." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", writeLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  try {
    const [user] = await db
      .select({ id: users.id, role: users.role, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Use constant-time check even when user doesn't exist to prevent timing attacks
    const hash = user?.passwordHash ?? "$2a$12$invalidhashfortimingnonce00000000000000000000000000000";
    const match = await bcrypt.compare(password, hash);

    if (!user || !user.passwordHash || !match) {
      res.status(401).json({ error: "Incorrect email or password." });
      return;
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    const token = signSession({ sub: user.id, role: user.role as "user" | "admin" });
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
    res.json({ ok: true, token });
  } catch (err) {
    console.error("login failed:", err);
    res.status(500).json({ error: "Sign-in failed. Try again shortly." });
  }
});

const OTP_TTL_MS         = 10 * 60 * 1000;   // 10 minutes
const OTP_MIN_RESEND_MS  = 60 * 1000;        // 1 minute between resends to the same email
const OTP_MAX_ATTEMPTS   = 5;                // verify attempts before code is invalidated

interface OtpRow {
  email:      string;
  codeHash:   string;
  expiresAt:  Date;
  attempts:   number;
  lastSentAt: Date;
}

interface UserIdRow {
  id:   string;
  role: string;
}

interface UserSummaryRow {
  id:          string;
  email:       string;
  displayName: string;
  github:      string | null;
  linkedin:    string | null;
  role:        string;
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code, "utf8").digest("hex");
}

function generateCode(): string {
  // 6 random digits with leading-zero padding. randomInt avoids modulo bias.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// ── POST /api/auth/request-otp ───────────────────────────────────────────────
router.post("/request-otp", otpRequestLimiter, async (req: Request, res: Response) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid email" });
    return;
  }
  const { email } = parsed.data;

  try {
    // Per-email cooldown: at most one new code per minute.
    const existing = await db
      .select()
      .from(emailOtps)
      .where(eq(emailOtps.email, email))
      .limit(1) as OtpRow[];

    if (existing[0]) {
      const sinceLast = Date.now() - new Date(existing[0].lastSentAt).getTime();
      if (sinceLast < OTP_MIN_RESEND_MS) {
        const retryAfter = Math.ceil((OTP_MIN_RESEND_MS - sinceLast) / 1000);
        res.setHeader("Retry-After", String(retryAfter));
        res.status(429).json({
          error:      `Please wait ${retryAfter}s before requesting another code.`,
          retryAfter,
        });
        return;
      }
    }

    const code      = generateCode();
    const codeHash  = hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await db.insert(emailOtps)
      .values({ email, codeHash, expiresAt, attempts: 0, lastSentAt: new Date() })
      .onConflictDoUpdate({
        target: emailOtps.email,
        set: { codeHash, expiresAt, attempts: 0, lastSentAt: new Date() },
      });

    try {
      await sendOtpEmail(email, code);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      res.status(502).json({ error: "Could not send the email. Try again shortly." });
      return;
    }

    res.json({ ok: true, message: "We sent a 6-digit code to your email." });
  } catch (err) {
    console.error("request-otp failed:", err);
    res.status(500).json({ error: "Could not start sign-in. Try again shortly." });
  }
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post("/verify-otp", otpVerifyLimiter, async (req: Request, res: Response) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { email, code } = parsed.data;

  try {
    const rows = await db
      .select()
      .from(emailOtps)
      .where(eq(emailOtps.email, email))
      .limit(1) as OtpRow[];

    const otp = rows[0];
    if (!otp) {
      res.status(400).json({ error: "No active code for this email. Request a new one." });
      return;
    }

    if (new Date(otp.expiresAt).getTime() < Date.now()) {
      await db.delete(emailOtps).where(eq(emailOtps.email, email));
      res.status(400).json({ error: "Code expired. Request a new one." });
      return;
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await db.delete(emailOtps).where(eq(emailOtps.email, email));
      res.status(429).json({ error: "Too many incorrect attempts. Request a new code." });
      return;
    }

    const expected = otp.codeHash;
    const got      = hashCode(code);
    // Constant-time compare to dodge any timing leaks.
    const ok =
      expected.length === got.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got));

    if (!ok) {
      await db.update(emailOtps)
        .set({ attempts: sql`${emailOtps.attempts} + 1` })
        .where(eq(emailOtps.email, email));
      res.status(400).json({ error: "Incorrect code." });
      return;
    }

    // Code matched — burn it and upsert the user.
    await db.delete(emailOtps).where(eq(emailOtps.email, email));

    const [upserted] = await db.insert(users)
      .values({
        email,
        emailVerifiedAt: new Date(),
        displayName: email.split("@")[0] ?? "Member",
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          emailVerifiedAt: sql`COALESCE(${users.emailVerifiedAt}, NOW())`,
          lastLoginAt: new Date(),
        },
      })
      .returning({ id: users.id, role: users.role }) as UserIdRow[];

    const { id, role } = upserted;
    const token = signSession({ sub: id, role: role as "user" | "admin" });
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions());

    // Hand back the token in the body too, so non-cookie clients (and
    // browsers in cookie-blocking mode) can use Authorization: Bearer.
    res.json({ ok: true, token });
  } catch (err) {
    console.error("verify-otp failed:", err);
    res.status(500).json({ error: "Sign-in failed. Try again shortly." });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [u] = await db
      .select({
        id:          users.id,
        email:       users.email,
        displayName: users.displayName,
        github:      users.github,
        linkedin:    users.linkedin,
        role:        users.role,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1) as UserSummaryRow[];
    if (!u) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }
    res.json({
      id:          u.id,
      email:       u.email,
      displayName: u.displayName,
      github:      u.github   ?? null,
      linkedin:    u.linkedin ?? null,
      role:        u.role,
    });
  } catch (err) {
    console.error("auth/me failed:", err);
    res.status(500).json({ error: "Failed to load session" });
  }
});

export default router;
