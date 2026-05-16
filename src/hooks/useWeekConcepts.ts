// ── useWeekConcepts hook ──────────────────────────────────────────────────────
// Fetches curated concepts linked to a specific (language, phase, week) tuple.
// Cached for 30 min — content rarely changes.

import { useQuery } from "@tanstack/react-query";
import { fetchWeekConcepts, type WeekConcept } from "../api/concepts";
import type { Language } from "../data/roadmap-index";
import { qk } from "../lib/queryKeys";

export function useWeekConcepts(language: Language, phase: number | undefined, week: number | undefined) {
  const enabled = Number.isFinite(phase) && Number.isFinite(week);
  const { data, isLoading } = useQuery<WeekConcept[]>({
    queryKey: qk.concepts.week(language, phase, week),
    queryFn:  () => fetchWeekConcepts(language, phase as number, week as number),
    enabled,
    staleTime: 30 * 60_000,
  });
  return { concepts: data ?? [], isLoading: isLoading && enabled };
}
