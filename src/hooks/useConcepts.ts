// ── useConcepts hook ──────────────────────────────────────────────────────────
// Fetches the full concept registry from /api/concepts and exposes derived
// helpers (lookup by slug, distinct categories) so every caller doesn't
// rebuild them. Content is stable; 30-min staleTime is fine.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllConcepts } from "../api/concepts";
import type { Concept, ConceptCategory } from "../lib/conceptTypes";

export function useConcepts() {
  const { data, isLoading } = useQuery<Concept[]>({
    queryKey: ["concepts", "all"],
    queryFn:  fetchAllConcepts,
    staleTime: 30 * 60_000,
    gcTime:    60 * 60_000,
  });

  const concepts = data ?? [];

  const { bySlug, categories } = useMemo(() => {
    return {
      bySlug:     new Map(concepts.map((c) => [c.slug, c])),
      categories: Array.from(new Set(concepts.map((c) => c.category))) as ConceptCategory[],
    };
  }, [concepts]);

  return { concepts, bySlug, categories, isLoading: isLoading && concepts.length === 0 };
}
