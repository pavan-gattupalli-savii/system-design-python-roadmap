// ── useRoadmap hook ────────────────────────────────────────────────────────────
// Returns roadmap phases for the given language.
// Strategy: start with the bundled static data (instant), then background-fetch
// from the API via React Query (auto-cached, deduped, and shared across tabs).
// On error or empty payload, keeps showing the static snapshot.

import { useQuery } from "@tanstack/react-query";
import { ROADMAPS } from "../data/roadmap-index";
import type { Language } from "../data/roadmap-index";
import type { Phase } from "../data/models";
import { fetchRoadmap } from "../api/roadmap";

export function useRoadmap(lang: Language): Phase[] {
  const { data } = useQuery<Phase[]>({
    queryKey: ["roadmap", lang],
    queryFn:  () => fetchRoadmap(lang),
    staleTime: 5 * 60_000,
  });
  return data && data.length ? data : ROADMAPS[lang];
}
