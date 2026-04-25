// ── Admin auth middleware ──────────────────────────────────────────────────────
import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"];
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    res.status(500).json({ error: "Server misconfiguration: ADMIN_API_KEY not set" });
    return;
  }

  if (!key || key !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
