// ── useRoadmap hook ────────────────────────────────────────────────────────────
// Fetches roadmap phases for the given language from the API.
// Data is shared across all call sites via TanStack Query's cache (key: ["roadmap", lang]).
// After first load it stays fresh for 30 min and alive in memory for 1 hr,
// so navigating between pages never triggers a second network request.

import { useQuery } from "@tanstack/react-query";
import type { Language } from "../data/roadmap-index";
import type { Phase } from "../data/models";
import { fetchRoadmap } from "../api/roadmap";

export function useRoadmap(lang: Language): { phases: Phase[]; isLoading: boolean } {
  const { data, isLoading } = useQuery<Phase[]>({
    queryKey:  ["roadmap", lang],
    queryFn:   () => fetchRoadmap(lang),
    staleTime: 30 * 60_000,   // treat as fresh for 30 min
    gcTime:    60 * 60_000,   // keep in memory for 1 hr after last subscriber
  });
  const phases = data ?? [];
  return { phases, isLoading: isLoading && phases.length === 0 };
}
