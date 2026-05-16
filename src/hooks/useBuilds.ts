// ── useBuilds hook ────────────────────────────────────────────────────────────
// Fetches and caches the user's build submissions for a given language.
// Returns a Map<resourceKey, BuildSubmission> for O(1) lookups in ResourceCard.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBuilds, submitBuild, deleteBuild, type BuildSubmission } from "../api/builds";
import { useAuth } from "../lib/auth";
import type { Language } from "../data/roadmap-index";
import { qk } from "../lib/queryKeys";

export function useBuilds(language: Language) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const buildsKey = qk.builds.byLang(language, user?.id);
  const meKey     = qk.me.profile(user?.id);

  const { data: rawList = [], isLoading } = useQuery<BuildSubmission[]>({
    queryKey: buildsKey,
    queryFn:  () => fetchBuilds(language),
    enabled:  !!user,
    staleTime: 60_000,
  });

  // Map for O(1) lookup by resourceKey
  const submissions = new Map<string, BuildSubmission>(
    rawList.map((s) => [s.resourceKey, s]),
  );

  const submitMutation = useMutation({
    mutationFn: ({ resourceKey, githubUrl, notes }: { resourceKey: string; githubUrl: string; notes?: string }) =>
      submitBuild(language, resourceKey, githubUrl, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildsKey });
      qc.invalidateQueries({ queryKey: meKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ resourceKey }: { resourceKey: string }) =>
      deleteBuild(language, resourceKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: buildsKey });
      qc.invalidateQueries({ queryKey: meKey });
    },
  });

  return {
    submissions,
    isLoading,
    submit:       submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    remove:       deleteMutation.mutate,
    isRemoving:   deleteMutation.isPending,
  };
}
