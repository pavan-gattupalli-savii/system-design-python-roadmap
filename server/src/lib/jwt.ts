// ── JWT signing / verification ────────────────────────────────────────────────
// HS256 with a single shared secret. Tokens carry just the user id and role —
// fresh user info is always re-fetched from the DB by `requireAuth`.

import jwt from "jsonwebtoken";

const SECRET     = process.env.JWT_SECRET ?? "";
const TTL_DAYS   = 7;
export const SESSION_COOKIE = "sd_session";
export const SESSION_TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

if (!SECRET) {
  console.warn(
    "[jwt] JWT_SECRET is not set. Authenticated routes will reject all tokens. " +
    "Generate one with: openssl rand -base64 48"
  );
}

export interface SessionPayload {
  sub:  string;          // user id
  role: "user" | "admin";
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: `${TTL_DAYS}d`,
  });
}

export function verifySession(token: string): SessionPayload | null {
  if (!SECRET) return null;
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
    if (typeof decoded !== "object" || decoded === null) return null;
    const { sub, role } = decoded as Record<string, unknown>;
    if (typeof sub !== "string") return null;
    if (role !== "user" && role !== "admin") return null;
    return { sub, role };
  } catch {
    return null;
  }
}

/**
 * Cookie attributes for `Set-Cookie`. In production we need
 * `SameSite=None; Secure` so the cookie is sent on cross-site XHRs from
 * GitHub Pages → Railway. In local dev we relax that to `Lax`.
 */
export function sessionCookieOptions(): {
  httpOnly: true;
  secure:   boolean;
  sameSite: "lax" | "none";
  path:     "/";
  maxAge:   number;
} {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? "none" : "lax",
    path:     "/",
    maxAge:   SESSION_TTL_MS,
  };
}
