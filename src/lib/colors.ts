// ── Brand color palette ──────────────────────────────────────────────────────
// JS-side mirror of the CSS variables in App.css. Use these for any inline
// style where you need string concatenation (e.g. ACCENT.indigo + "22" for
// alpha) — CSS vars can't be composed that way.
//
// Prefer the matching var(--accent-X) in CSS-class-driven styling.

export const ACCENT = {
  indigo: "#6366f1",
  violet: "#a5b4fc",
  purple: "#8b5cf6",
  amber:  "#fbbf24",
  orange: "#fb923c",
  green:  "#4ade80",
  mint:   "#6ee7b7",
  red:    "#f87171",
  cyan:   "#67e8f9",
} as const;

export type AccentName = keyof typeof ACCENT;
