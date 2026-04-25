// ── HTTP cache helpers ────────────────────────────────────────────────────────
// Adds Cache-Control + ETag handling for GET /api/* read endpoints so browsers
// (and any proxy in between) can serve repeated views from cache instead of
// re-hitting Neon on every keystroke.

import type { Request, Response, NextFunction } from "express";
import etag from "etag";

interface CacheOptions {
  /** Max-age in seconds (default 300 = 5min) */
  maxAge?: number;
  /** stale-while-revalidate window in seconds (default 1800 = 30min) */
  swr?:    number;
}

/**
 * Send `data` as JSON with a strong ETag and a Cache-Control header.
 * If the client already has a fresh copy (If-None-Match matches), respond 304.
 *
 * Defaults are aggressive (5min fresh / 30min SWR) because the readings,
 * interviews and experiences endpoints change rarely and are public. Browsers
 * + CDNs that honour SWR will serve stale instantly while revalidating in the
 * background — eliminating the perceived "cold start" on slow fetches.
 */
export function sendCached<T>(res: Response, req: Request, data: T, opts: CacheOptions = {}): void {
  const body   = JSON.stringify(data);
  const tag    = etag(body);
  const maxAge = opts.maxAge ?? 300;
  const swr    = opts.swr    ?? 1800;

  res.setHeader("Cache-Control", `public, max-age=${maxAge}, stale-while-revalidate=${swr}`);
  res.setHeader("ETag", tag);
  // Cookie + Authorization both feed `requireAuth` — vary on either so caches
  // never serve a logged-in payload to an anonymous follower.
  res.setHeader("Vary", "Accept-Encoding, Cookie, Authorization");

  if (req.headers["if-none-match"] === tag) {
    res.status(304).end();
    return;
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(body);
}

/** Adds a per-request server-timing-style log: METHOD URL STATUS DURATIONms. */
export function timingLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    // Skip noisy /health pings unless they're slow.
    if (req.url === "/health" && ms < 200) return;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

/**
 * Hard request timeout. If a handler hasn't responded within `ms`, send a
 * 503 so the browser can move on instead of spinning forever. The handler
 * keeps running but its eventual response is dropped.
 */
export function requestTimeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (res.headersSent) return;
      console.warn(`⏱  timeout after ${ms}ms: ${req.method} ${req.originalUrl}`);
      res.status(503).json({ error: "Request timed out — please retry." });
    }, ms);
    res.on("finish", () => clearTimeout(timer));
    res.on("close",  () => clearTimeout(timer));
    next();
  };
}
