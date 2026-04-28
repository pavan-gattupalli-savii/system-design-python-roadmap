// ── ROADMAP REGISTRY ──────────────────────────────────────────────────────────
// Language ID type used throughout the app.
// Roadmap data is served from the API (/api/roadmap/:language) and cached
// by useRoadmap — the source of truth is the database, not bundled TS files.

export type Language = "python" | "java";
