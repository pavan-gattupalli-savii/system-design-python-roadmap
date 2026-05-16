// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
// Shared theme primitives. Component-level colours live in CSS variables
// (defined in index.css and toggled per theme) — this file only holds tokens
// that have to be JS-readable.

export const FONT_STACK = "'Inter', 'SF Pro Display', system-ui, sans-serif";

// Viewport breakpoint for the mobile layout
export const BREAKPOINTS = { mobile: 768 } as const;
