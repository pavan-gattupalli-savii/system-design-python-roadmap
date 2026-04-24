// ── SHARED localStorage HELPERS ───────────────────────────────────────────────
// Generic typed helpers used across ReadingsTab, InterviewTab, etc.
// Handles JSON parse errors and SSR-safe access transparently.

/** Load a Set<number> from localStorage. Returns an empty set on error. */
export function loadSet(key: string): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]") as number[]); }
  catch { return new Set(); }
}

/** Persist a Set<number> to localStorage. Silently swallows storage errors. */
export function saveSet(key: string, v: Set<number>): void {
  try { localStorage.setItem(key, JSON.stringify([...v])); } catch {}
}
