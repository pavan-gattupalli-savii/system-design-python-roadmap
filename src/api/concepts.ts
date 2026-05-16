// ── Concepts API ──────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Language } from "../data/roadmap-index";

export interface WeekConcept {
  slug:     string;
  title:    string;
  emoji:    string;
  category: string;
  tagline:  string;
}

/** GET /api/concepts/week/:language/:phase/:week — curated concepts for one week. */
export async function fetchWeekConcepts(language: Language, phase: number, week: number): Promise<WeekConcept[]> {
  return apiFetch<WeekConcept[]>(`/api/concepts/week/${language}/${phase}/${week}`);
}
