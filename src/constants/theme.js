// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
// Every hardcoded colour, font, and size in one place.
// Migrating to TypeScript: add `as const` after each object literal.
// Migrating to CSS variables: generate var(--color-pageBg) from this file.

export const COLORS = {
  // Backgrounds
  pageBg:        "#060a10",
  panelBg:       "#0d1117",
  panelDark:     "#090e16",
  panelMid:      "#111827",

  // Borders
  border:        "#1c2430",
  borderDark:    "#161b22",
  borderMid:     "#21262d",
  borderFaint:   "#1f2937",

  // Text scale
  textPrimary:   "#f0f6ff",
  textSecondary: "#e2e8f0",
  textBody:      "#c9d8e8",
  textMuted:     "#64748b",
  textFaint:     "#374151",
  textSubtle:    "#4b5563",
  textDim:       "#6b7280",

  // Brand accents
  accentGreen:   "#4ade80",
  accentGreenBg: "#1a4d2e",
  accentIndigo:  "#6366f1",
  accentViolet:  "#a5b4fc",
  accentPurple:  "#8b5cf6",
  accentAmber:   "#fbbf24",
};

export const FONT_STACK = "'Inter', 'SF Pro Display', system-ui, sans-serif";

// Viewport breakpoint for the mobile layout
export const BREAKPOINTS = { mobile: 768 };

// Left-sidebar column widths (px)
export const PANEL_WIDTH = { phases: 200, weeks: 170 };
