// ── useDailyTopic hook ────────────────────────────────────────────────────────
// Fetches today's topic + user streak from the server.
// Provides a mutation to mark the topic as "read" (auth required).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useAuth } from "../lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DailyTopic {
  sourceType:  "session" | "reading";
  title:       string;
  description: string;
  url?:        string;
  mins?:       number;
  tags:        string[];
  phase?:      number;
  phaseTitle?: string;
  weekNum?:    number;
  weekTitle?:  string;
  completed:   boolean;
  streak:      number;
  todayDate:   string;  // "YYYY-MM-DD"
  poolSize:    number;
}

export interface DailyHistory {
  dates: string[];  // "YYYY-MM-DD" strings the user has completed
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const dailyKeys = {
  today:   ["daily", "today"] as const,
  history: (days: number) => ["daily", "history", days] as const,
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UseDailyTopicResult {
  topic:      DailyTopic | undefined;
  isLoading:  boolean;
  markAsRead: () => void;
  isMarking:  boolean;
}

export function useDailyTopic(): UseDailyTopicResult {
  const qc       = useQueryClient();
  const { user } = useAuth();

  const query = useQuery<DailyTopic>({
    queryKey: dailyKeys.today,
    queryFn:  () => apiFetch<DailyTopic>("/api/daily-topic"),
    staleTime: 5 * 60_000,  // re-fetch at most every 5 min
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: () => apiFetch<{ ok: boolean; completed: boolean; streak: number }>(
      "/api/daily-topic/complete",
      { method: "POST" },
    ),
    onMutate: async () => {
      // Optimistic update — mark completed + bump streak by 1
      await qc.cancelQueries({ queryKey: dailyKeys.today });
      const prev = qc.getQueryData<DailyTopic>(dailyKeys.today);
      if (prev) {
        qc.setQueryData<DailyTopic>(dailyKeys.today, {
          ...prev,
          completed: true,
          streak:    prev.streak + 1,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      // Roll back on failure
      if (ctx?.prev) qc.setQueryData(dailyKeys.today, ctx.prev);
    },
    onSuccess: (data) => {
      // Sync server streak (may differ from optimistic)
      qc.setQueryData<DailyTopic>(dailyKeys.today, (old) =>
        old ? { ...old, completed: true, streak: data.streak } : old,
      );
      qc.invalidateQueries({ queryKey: ["daily", "history"] });
    },
  });

  return {
    topic:      query.data,
    isLoading:  query.isLoading,
    markAsRead: () => { if (user && !query.data?.completed) mutation.mutate(); },
    isMarking:  mutation.isPending,
  };
}

// ── History hook ──────────────────────────────────────────────────────────────

export function useDailyHistory(days = 30): { dates: Set<string>; isLoading: boolean } {
  const { user } = useAuth();

  const query = useQuery<DailyHistory>({
    queryKey: dailyKeys.history(days),
    queryFn:  () => apiFetch<DailyHistory>(`/api/daily-topic/history?days=${days}`),
    enabled:  !!user,
    staleTime: 5 * 60_000,
  });

  return {
    dates:     new Set(query.data?.dates ?? []),
    isLoading: query.isLoading,
  };
}
