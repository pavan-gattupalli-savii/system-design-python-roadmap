// ── useMyInteractions hook ───────────────────────────────────────────────────
// Single source of truth for the per-user interaction sets:
//   - readingUpvotes  → IDs of readings this user has upvoted
//   - expUpvotes      → IDs of experiences this user has upvoted
//   - practiced       → IDs of interview questions ticked as practiced
//
// Backed by two tiny GETs (`/api/me/upvotes`, `/api/me/practiced`) merged into
// one React Query entry so callers re-render once. Mutation helpers do an
// optimistic toggle + roll back on failure.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useAuth } from "../lib/auth";

interface UpvotesResponse {
  readings:    string[];
  experiences: string[];
}

export interface MyInteractions {
  readingUpvotes: Set<string>;
  expUpvotes:     Set<string>;
  practiced:      Set<string>;
}

const QK = ["me", "interactions"] as const;

async function fetchInteractions(): Promise<MyInteractions> {
  const [upvotes, practiced] = await Promise.all([
    apiFetch<UpvotesResponse>("/api/me/upvotes"),
    apiFetch<string[]>("/api/me/practiced"),
  ]);
  return {
    readingUpvotes: new Set(upvotes.readings),
    expUpvotes:     new Set(upvotes.experiences),
    practiced:      new Set(practiced),
  };
}

const EMPTY: MyInteractions = {
  readingUpvotes: new Set(),
  expUpvotes:     new Set(),
  practiced:      new Set(),
};

export function useMyInteractions() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery<MyInteractions>({
    queryKey: QK,
    queryFn:  fetchInteractions,
    enabled:  !!user,
    staleTime: 60_000,
  });

  function patchSet(
    field: "readingUpvotes" | "expUpvotes" | "practiced",
    id:    string,
    add:   boolean,
  ) {
    qc.setQueryData<MyInteractions>(QK, (prev) => {
      const base = prev ?? EMPTY;
      const next = new Set(base[field]);
      if (add) next.add(id); else next.delete(id);
      return { ...base, [field]: next };
    });
  }

  // ── Reading upvote toggle ─────────────────────────────────────────────────
  const toggleReadingUpvote = useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      const data = await apiFetch<{ upvoted: boolean; upvotes: number }>(
        `/api/readings/${id}/upvote`,
        { method: on ? "POST" : "DELETE" },
      );
      return data;
    },
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<MyInteractions>(QK);
      patchSet("readingUpvotes", id, on);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(QK, context.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["readings"] });
      qc.invalidateQueries({ queryKey: ["bootstrap"] });
    },
  });

  // ── Experience upvote toggle ──────────────────────────────────────────────
  const toggleExperienceUpvote = useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      const data = await apiFetch<{ upvoted: boolean; upvotes: number }>(
        `/api/experiences/${id}/upvote`,
        { method: on ? "POST" : "DELETE" },
      );
      return data;
    },
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<MyInteractions>(QK);
      patchSet("expUpvotes", id, on);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(QK, context.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["experiences"] });
      qc.invalidateQueries({ queryKey: ["bootstrap"] });
    },
  });

  // ── Practiced toggle ──────────────────────────────────────────────────────
  const togglePracticed = useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      await apiFetch<{ ok: true }>("/api/me/practiced", {
        method: "POST",
        body:   JSON.stringify({ questionId: id, done: on }),
      });
    },
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<MyInteractions>(QK);
      patchSet("practiced", id, on);
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(QK, context.prev);
    },
  });

  return {
    data: query.data ?? EMPTY,
    isLoading: query.isLoading && !!user,
    toggleReadingUpvote,
    toggleExperienceUpvote,
    togglePracticed,
  };
}
