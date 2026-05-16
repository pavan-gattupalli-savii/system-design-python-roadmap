// ── Concepts API ──────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Language } from "../data/roadmap-index";
import type { Concept, ConceptCategory } from "../lib/conceptTypes";

export interface WeekConcept {
  slug:     string;
  title:    string;
  emoji:    string;
  category: string;
  tagline:  string;
}

/** Lightweight concept descriptor — no sections, no related, no keywords. */
export interface ConceptSummary {
  slug:     string;
  title:    string;
  emoji:    string;
  category: ConceptCategory;
  tagline:  string;
}

/** GET /api/concepts/week/:language/:phase/:week — curated concepts for one week. */
export async function fetchWeekConcepts(language: Language, phase: number, week: number): Promise<WeekConcept[]> {
  return apiFetch<WeekConcept[]>(`/api/concepts/week/${language}/${phase}/${week}`);
}

/** GET /api/concepts/summaries — sidebar list, no section bodies. */
export async function fetchConceptSummaries(): Promise<ConceptSummary[]> {
  return apiFetch<ConceptSummary[]>(`/api/concepts/summaries`);
}

/** GET /api/concepts/:slug — full single concept with sections. */
export async function fetchConceptBySlug(slug: string): Promise<Concept> {
  return apiFetch<Concept>(`/api/concepts/${encodeURIComponent(slug)}`);
}

/** GET /api/concepts — full list. Kept for back-compat with hooks that still need all sections. */
export async function fetchAllConcepts(): Promise<Concept[]> {
  return apiFetch<Concept[]>(`/api/concepts`);
}
