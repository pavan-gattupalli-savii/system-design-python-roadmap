// ── Concept hooks ────────────────────────────────────────────────────────────
// Two-tier loader to keep payloads small:
//   - useConceptSummaries() → cheap sidebar/category list (~5KB, no sections)
//   - useConceptDetail(slug) → full concept with sections, fetched on demand
//
// useConcepts() remains for callers that need every section bundled — but new
// code should prefer the split versions.

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllConcepts, fetchConceptSummaries, fetchConceptBySlug, type ConceptSummary } from "../api/concepts";
import type { Concept, ConceptCategory } from "../lib/conceptTypes";
import { qk } from "../lib/queryKeys";

/** Lightweight summaries for sidebar / category nav. */
export function useConceptSummaries() {
  const { data, isLoading } = useQuery<ConceptSummary[]>({
    queryKey: [...qk.concepts.all, "summaries"] as const,
    queryFn:  fetchConceptSummaries,
    staleTime: 30 * 60_000,
    gcTime:    60 * 60_000,
  });

  const summaries = data ?? [];
  const categories = useMemo(
    () => Array.from(new Set(summaries.map((c) => c.category))) as ConceptCategory[],
    [summaries],
  );

  return { summaries, categories, isLoading: isLoading && summaries.length === 0 };
}

/** Full concept content for a single slug — lazy-loaded by ConceptsPage. */
export function useConceptDetail(slug: string | undefined) {
  const { data, isLoading } = useQuery<Concept>({
    queryKey: [...qk.concepts.all, "detail", slug ?? null] as const,
    queryFn:  () => fetchConceptBySlug(slug as string),
    enabled:  !!slug,
    staleTime: 30 * 60_000,
    gcTime:    60 * 60_000,
  });
  return { concept: data ?? null, isLoading: isLoading && !data };
}

/** Legacy full-list hook — kept for any caller still bundling every section. */
export function useConcepts() {
  const { data, isLoading } = useQuery<Concept[]>({
    queryKey: qk.concepts.all,
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
