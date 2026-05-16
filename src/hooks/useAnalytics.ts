// ── useAnalytics hook ─────────────────────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics, type AnalyticsResponse } from "../api/analytics";
import { useAuth } from "../lib/auth";
import type { Language } from "../data/roadmap-index";

export function useAnalytics(language: Language) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["analytics", language, user?.id],
    queryFn:  () => fetchAnalytics(language),
    enabled:  !!user,
    staleTime: 60_000,
  });
  return { analytics: data, isLoading };
}
