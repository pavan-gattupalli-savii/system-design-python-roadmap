// ── APP CONSTANTS ──────────────────────────────────────────────────────────────
// All user-visible labels, keys, and URLs in one place.
// To rebrand or reconfigure: edit here — nothing else needs to change.
import type { Tab } from "../data/models";

export const APP_TITLE    = "System Design Roadmap";
export const APP_SUBTITLE = "Python · Java · 49–54 weeks · 9 phases";

// Per-language sessionStorage keys — bump the version to reset saved progress.
export const STORAGE_KEYS: Record<string, string> = {
  python: "sd_progress_python_v1",
  java:   "sd_progress_java_v1",
};

// ── LANGUAGE DEFINITIONS ────────────────────────────────────────────────────
export interface LanguageDef {
  id:    "python" | "java";
  label: string;
  icon:  string;
  /** Accent colour used for the active language button */
  accent: string;
  /** Lighter tint for text on dark background */
  color:  string;
  /** Info bar text shown in the roadmap tab */
  info: { books: string; hrsPerWeek: string };
}

export const LANGUAGES: LanguageDef[] = [
  {
    id: "python", label: "Python", icon: "🐍",
    accent: "#059669", color: "#6ee7b7",
    info: { books: "DDIA · Fluent Python · Head First DP · SDI Vol 1–2", hrsPerWeek: "8–12" },
  },
  {
    id: "java", label: "Java", icon: "☕",
    accent: "#d97706", color: "#fcd34d",
    info: { books: "DDIA · Effective Java · JCIP · SDI Vol 1–2", hrsPerWeek: "10–14" },
  },
];

// Google Sheets tracker — update this URL when the spreadsheet changes.
export const TRACKER_URL =
  "https://docs.google.com/spreadsheets/d/1w3S42p_ZAH9t_OLJQZ8N5fkFy4wHnmdj/edit?usp=drivesdk&ouid=106113630169695081159&rtpof=true&sd=true";

// Navigation tabs — add, remove, or reorder here; the UI auto-renders them.
export const TABS: Tab[] = [
  { id: "roadmap", label: "📚 Roadmap" },
  { id: "tracker", label: "📊 Overview" },
  { id: "about",   label: "👤 About"   },
];
