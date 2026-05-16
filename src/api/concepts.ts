// ── Concepts API ──────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Language } from "../data/roadmap-index";
import type { Concept } from "../lib/conceptTypes";

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

/** GET /api/concepts — full list with sections + related + roadmap_keywords. */
export async function fetchAllConcepts(): Promise<Concept[]> {
  return apiFetch<Concept[]>(`/api/concepts`);
}
