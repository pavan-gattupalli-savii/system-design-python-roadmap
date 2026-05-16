// ── useCheckpoints hook ───────────────────────────────────────────────────────
// Public list of questions (no auth needed). Submit + status require auth.

import { useQuery } from "@tanstack/react-query";
import { fetchCheckpoints, fetchMyCheckpointStatus, type CheckpointQuestion, type PhaseCheckpointStatus } from "../api/checkpoints";
import type { Language } from "../data/roadmap-index";
import { useAuth } from "../lib/auth";

export function useCheckpoints(language: Language, phase: number) {
  const { data, isLoading } = useQuery<CheckpointQuestion[]>({
    queryKey: ["checkpoints", language, phase],
    queryFn:  () => fetchCheckpoints(language, phase),
    staleTime: 30 * 60_000,
  });
  return { questions: data ?? [], isLoading };
}

/** Per-phase pass status for the signed-in user across all phases of a language. */
export function useMyCheckpointStatus(language: Language) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<PhaseCheckpointStatus>({
    queryKey: ["checkpoint-status", language, user?.id],
    queryFn:  () => fetchMyCheckpointStatus(language),
    enabled:  !!user,
    staleTime: 60_000,
  });
  return { status: data ?? {}, isLoading };
}
