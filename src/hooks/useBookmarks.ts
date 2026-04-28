// ── useBookmarks hook ─────────────────────────────────────────────────────────
// Single source of truth for the per-user bookmark Sets.
// Backed by GET /api/me/bookmarks (unresolved, lightweight).
// Mutation helper does an optimistic toggle + rolls back on failure.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBookmarks, addBookmark, removeBookmark } from "../api/bookmarks";
import type { BookmarkType, BookmarksResponse } from "../api/bookmarks";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export interface MyBookmarks {
  reading:          Set<string>;
  experience:       Set<string>;
  question:         Set<string>;
  roadmap_resource: Set<string>;
}

export const QK = ["me", "bookmarks"] as const;

const EMPTY: MyBookmarks = {
  reading:          new Set(),
  experience:       new Set(),
  question:         new Set(),
  roadmap_resource: new Set(),
};

function responseToSets(r: BookmarksResponse): MyBookmarks {
  return {
    reading:          new Set(r.reading),
    experience:       new Set(r.experience),
    question:         new Set(r.question),
    roadmap_resource: new Set(r.roadmap_resource),
  };
}

export function useBookmarks() {
  const { user } = useAuth();
  const qc       = useQueryClient();
  const navigate = useNavigate();

  const query = useQuery<MyBookmarks>({
    queryKey: QK,
    queryFn:  () => fetchBookmarks().then(responseToSets),
    enabled:  !!user,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async ({ type, id, on }: { type: BookmarkType; id: string; on: boolean }) => {
      if (on) return addBookmark(type, id);
      return removeBookmark(type, id);
    },
    onMutate: async ({ type, id, on }) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<MyBookmarks>(QK);
      // Optimistic update
      qc.setQueryData<MyBookmarks>(QK, (old) => {
        const base = old ?? EMPTY;
        const next = new Set(base[type]);
        if (on) next.add(id); else next.delete(id);
        return { ...base, [type]: next };
      });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(QK, context.prev);
    },
    // Invalidate resolved bookmarks cache so the BookmarksTab refreshes.
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["me", "bookmarks-resolved"] });
    },
  });

  /**
   * Toggle a bookmark. Redirects unauthenticated users to /sign-in.
   * @param type  Resource type discriminator
   * @param id    UUID (for DB items) or resId string (for roadmap resources)
   * @param redirectPath  Used in the sign-in redirect ?next= param
   */
  function toggleBookmark(type: BookmarkType, id: string, redirectPath = "/app") {
    if (!user) {
      navigate(`/sign-in?next=${encodeURIComponent(redirectPath)}`);
      return;
    }
    const isBookmarked = (query.data ?? EMPTY)[type].has(id);
    mutation.mutate({ type, id, on: !isBookmarked });
  }

  return {
    bookmarks:      query.data ?? EMPTY,
    isLoading:      query.isLoading && !!user,
    toggleBookmark,
  };
}
