// Persist the last roadmap (language, phase, week) the user opened so the
// Home page can offer a "Continue where you left off" CTA across sessions.

import type { Language } from "../data/roadmap-index";

const STORAGE_KEY = "sd-last-visited";

export interface LastVisited {
  language: Language;
  phase: number;
  week: number;
  updatedAt: string;
}

export function getLastVisited(): LastVisited | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastVisited>;
    if (!parsed.language || !parsed.phase || !parsed.week) return null;
    return parsed as LastVisited;
  } catch {
    return null;
  }
}

export function setLastVisited(language: Language, phase: number, week: number): void {
  try {
    const payload: LastVisited = { language, phase, week, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be disabled — silently degrade.
  }
}
