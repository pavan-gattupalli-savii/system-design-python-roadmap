// ── Auth middleware ───────────────────────────────────────────────────────────
// Reads the session JWT from the `sd_session` HTTP-only cookie, verifies it,
// loads the user from our `users` table, and attaches a typed `req.user`.

import type { Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { SESSION_COOKIE, verifySession } from "../lib/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface UserContext {
      id:          string;
      email:       string;
      displayName: string;
      role:        "user" | "admin";
      github?:     string;
      linkedin?:   string;
    }
    interface Request {
      user?: UserContext;
    }
  }
}

async function loadUser(userId: string): Promise<Express.UserContext | null> {
  const [row] = await db
    .select({
      id:          users.id,
      email:       users.email,
      displayName: users.displayName,
      github:      users.github,
      linkedin:    users.linkedin,
      role:        users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return null;
  return {
    id:          row.id,
    email:       row.email,
    displayName: row.displayName,
    role:        row.role as "user" | "admin",
    github:      row.github  ?? undefined,
    linkedin:    row.linkedin ?? undefined,
  };
}

function readSessionToken(req: Request): string | null {
  // 1. Standard path: cookie set by /api/auth/verify-otp.
  const cookieToken = req.cookies?.[SESSION_COOKIE];
  if (typeof cookieToken === "string" && cookieToken.length > 0) return cookieToken;

  // 2. Fallback: Authorization: Bearer <token>. Useful for non-browser clients
  //    (curl / scripts) and as a safety net for browsers that block third-party
  //    cookies entirely.
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim() || null;
  }
  return null;
}

/** Reject the request if no valid session is present. */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = readSessionToken(req);
  if (!token) {
    res.status(401).json({ error: "Login required" });
    return;
  }
  const payload = verifySession(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }
  try {
    const user = await loadUser(payload.sub);
    if (!user) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth load failed:", err);
    res.status(500).json({ error: "Auth lookup failed" });
  }
}

/** Attach `req.user` if signed in, but allow anonymous access otherwise. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = readSessionToken(req);
  if (!token) { next(); return; }
  const payload = verifySession(token);
  if (!payload) { next(); return; }
  try {
    const user = await loadUser(payload.sub);
    if (user) req.user = user;
  } catch {
    // Anonymous fallthrough — never block on optional auth.
  }
  next();
}

/** Compose with `requireAuth`. Rejects non-admins with 403. */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Login required" });
    return;
  }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}
