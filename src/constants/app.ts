// ── APP CONSTANTS ──────────────────────────────────────────────────────────────
// All user-visible labels, keys, and URLs in one place.
// To rebrand or reconfigure: edit here — nothing else needs to change.
import type { Tab } from "../data/models";

export const APP_TITLE    = "🐍 System Design Roadmap";
export const APP_SUBTITLE = "Python-first · 40 weeks · 7 phases";

export const TOTAL_WEEKS  = 40;

// localStorage key for progress persistence.
// Bump the version suffix (v1 → v2) to reset all users' saved progress.
export const STORAGE_KEY = "sd_progress_v1";

// Google Sheets tracker — update this URL when the spreadsheet changes.
export const TRACKER_URL =
  "https://docs.google.com/spreadsheets/d/1w3S42p_ZAH9t_OLJQZ8N5fkFy4wHnmdj/edit?usp=drivesdk&ouid=106113630169695081159&rtpof=true&sd=true";

// Navigation tabs — add, remove, or reorder here; the UI auto-renders them.
export const TABS: Tab[] = [
  { id: "roadmap", label: "📚 Roadmap" },
  { id: "tracker", label: "📊 Overview" },
  { id: "about",   label: "👤 About"   },
];
