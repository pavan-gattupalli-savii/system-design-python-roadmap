// ── Query keys ────────────────────────────────────────────────────────────────
// One source of truth for every React Query cache key in the app. Functions
// (not plain arrays) make invalidation safer: TS catches typos, and a key
// shape can be evolved in one place.
//
// Pattern: each domain exposes `.all`, `.list(args)`, `.detail(id)` so
// `queryClient.invalidateQueries({ queryKey: qk.foo.all })` clears every
// subkey for that domain in one call (TanStack matches prefixes).

import type { Language } from "../data/roadmap-index";

export const qk = {
  // ── Auth + profile ───────────────────────────────────────────────────────
  auth: {
    me: ["auth", "me"] as const,
  },
  me: {
    all:        ["me"] as const,
    profile:    (userId: string | undefined) => ["me", userId] as const,
    bookmarks:  ["me", "bookmarks"] as const,
    resolvedBookmarks: ["me", "bookmarks-resolved"] as const,
  },

  // ── Roadmap content ──────────────────────────────────────────────────────
  roadmap: {
    byLang: (lang: Language) => ["roadmap", lang] as const,
  },

  // ── Per-user resource progress ───────────────────────────────────────────
  progress: {
    byLang: (userId: string | undefined, lang: Language) => ["progress", userId, lang] as const,
  },

  // ── Build submissions ────────────────────────────────────────────────────
  builds: {
    all:    ["builds"] as const,
    byLang: (lang: Language, userId: string | undefined) => ["builds", lang, userId] as const,
  },

  // ── Notes ────────────────────────────────────────────────────────────────
  notes: {
    byLang: (lang: Language, userId: string | undefined) => ["notes", lang, userId] as const,
  },

  // ── Concepts ─────────────────────────────────────────────────────────────
  concepts: {
    all:    ["concepts", "all"] as const,
    week:   (lang: Language, phase: number | undefined, week: number | undefined) =>
              ["week-concepts", lang, phase, week] as const,
  },

  // ── Checkpoints ──────────────────────────────────────────────────────────
  checkpoints: {
    byPhase: (lang: Language, phase: number) => ["checkpoints", lang, phase] as const,
    myStatus: (lang: Language, userId: string | undefined) => ["checkpoint-status", lang, userId] as const,
  },

  // ── Analytics ────────────────────────────────────────────────────────────
  analytics: {
    byLang: (lang: Language, userId: string | undefined) => ["analytics", lang, userId] as const,
  },

  // ── Daily topic ──────────────────────────────────────────────────────────
  daily: {
    history: ["daily", "history"] as const,
  },

  // ── Community lists (read by infinite/list hooks elsewhere) ──────────────
  readings:    ["readings"] as const,
  experiences: ["experiences"] as const,
} as const;
