// ── useMyInteractions hook ───────────────────────────────────────────────────
// Single source of truth for the per-user interaction sets:
//   - readingUpvotes  → IDs of readings this user has upvoted
//   - expUpvotes      → IDs of experiences this user has upvoted
//   - practiced       → IDs of interview questions ticked as practiced
//
// Backed by two tiny GETs (`/api/me/upvotes`, `/api/me/practiced`) merged into
// one React Query entry so callers re-render once. Mutation helpers do an
// optimistic toggle (including the displayed count) + roll back on failure.

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

// Minimal shapes for optimistic cache patching — avoids importing full types
type WithUpvotes = { id: string; upvotes: number; [k: string]: unknown };
type PagedList   = { data: WithUpvotes[]; page: number; limit: number };

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

/** Patch a single item's upvote count in every matching paged-list query. */
function patchCount(
  qc: ReturnType<typeof useQueryClient>,
  queryKey: unknown[],
  id: string,
  newCount: number,
) {
  qc.setQueriesData<PagedList>({ queryKey }, (old) => {
    if (!old) return old;
    return { ...old, data: old.data.map((r) => r.id === id ? { ...r, upvotes: newCount } : r) };
  });
}

/** Snapshot every paged-list entry so we can roll back on error. */
function snapshotQueries(qc: ReturnType<typeof useQueryClient>, queryKey: unknown[]) {
  return qc.getQueriesData<PagedList>({ queryKey });
}

/** Restore snapshotted paged-list entries. */
function restoreQueries(
  qc: ReturnType<typeof useQueryClient>,
  snapshots: [readonly unknown[], PagedList | undefined][],
) {
  snapshots.forEach(([key, data]) => { if (data !== undefined) qc.setQueryData(key as unknown[], data); });
}

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
      await qc.cancelQueries({ queryKey: ["readings"] });
      const prev         = qc.getQueryData<MyInteractions>(QK);
      const prevReadings = snapshotQueries(qc, ["readings"]);
      patchSet("readingUpvotes", id, on);
      // Optimistically adjust the displayed count by ±1
      qc.setQueriesData<PagedList>({ queryKey: ["readings"] }, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((r) => r.id === id ? { ...r, upvotes: r.upvotes + (on ? 1 : -1) } : r) };
      });
      return { prev, prevReadings };
    },
    onSuccess: (data, { id }) => {
      // Reconcile with the exact count the server returned
      patchCount(qc, ["readings"], id, data.upvotes);
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(QK, context.prev);
      if (context?.prevReadings) restoreQueries(qc, context.prevReadings);
    },
    // No list invalidation on settled — onSuccess already reconciles the exact
    // count from the server response. Invalidating would trigger a refetch that
    // hits the browser's HTTP cache (max-age=300s) and overwrite the correct count.
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
      await qc.cancelQueries({ queryKey: ["experiences"] });
      const prev            = qc.getQueryData<MyInteractions>(QK);
      const prevExperiences = snapshotQueries(qc, ["experiences"]);
      patchSet("expUpvotes", id, on);
      // Optimistically adjust the displayed count by ±1
      qc.setQueriesData<PagedList>({ queryKey: ["experiences"] }, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.map((e) => e.id === id ? { ...e, upvotes: e.upvotes + (on ? 1 : -1) } : e) };
      });
      return { prev, prevExperiences };
    },
    onSuccess: (data, { id }) => {
      // Reconcile with the exact count the server returned
      patchCount(qc, ["experiences"], id, data.upvotes);
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(QK, context.prev);
      if (context?.prevExperiences) restoreQueries(qc, context.prevExperiences);
    },
    // No list invalidation on settled — same reason as readings above.
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
