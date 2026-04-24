// ── RESOURCE TYPES ─────────────────────────────────────────────────────────────
// Each resource card is tagged with one of these types.
// Change bg / tx / icon here to restyle all cards of that type at once.
import type { TypeStyle } from "./models";

export const TYPES: Record<string, TypeStyle> = {
  "Book":       { bg: "#1a2740", tx: "#7eb8f7", icon: "📖" },
  "YouTube":    { bg: "#3b0a0a", tx: "#f87171", icon: "▶"  },
  "Docs":       { bg: "#0f2a18", tx: "#6ee7b7", icon: "📄" },
  "Article":    { bg: "#2a1f00", tx: "#fbbf24", icon: "📰" },
  "Build":      { bg: "#1a0a3b", tx: "#c4b5fd", icon: "🔨" },
  "Practice":   { bg: "#3b0f1a", tx: "#f9a8d4", icon: "🎯" },
  "Ask Claude": { bg: "#0a2030", tx: "#67e8f9", icon: "🤖" },
  "Platform":   { bg: "#0f2a20", tx: "#86efac", icon: "🌐" },
  "Blog":       { bg: "#2a1500", tx: "#fb923c", icon: "✍️" },
};
