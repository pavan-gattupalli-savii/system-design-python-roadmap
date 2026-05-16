// ── useNotes hook ─────────────────────────────────────────────────────────────
// Fetches all of the current user's notes for a language and returns a
// Map<resourceKey, UserNote> for O(1) lookup in ResourceCard. Save/delete
// mutations invalidate the cache.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotes, saveNote, deleteNote, type UserNote } from "../api/notes";
import { useAuth } from "../lib/auth";
import type { Language } from "../data/roadmap-index";
import { qk } from "../lib/queryKeys";

export function useNotes(language: Language) {
  const { user } = useAuth();
  const qc       = useQueryClient();
  const key = qk.notes.byLang(language, user?.id);

  const { data: rawList = [], isLoading } = useQuery<UserNote[]>({
    queryKey: key,
    queryFn:  () => fetchNotes(language),
    enabled:  !!user,
    staleTime: 60_000,
  });

  const notes = new Map<string, UserNote>(rawList.map((n) => [n.resourceKey, n]));

  const saveMutation = useMutation({
    mutationFn: ({ resourceKey, bodyMd }: { resourceKey: string; bodyMd: string }) =>
      saveNote(language, resourceKey, bodyMd),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ resourceKey }: { resourceKey: string }) => deleteNote(language, resourceKey),
    onSuccess:  () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    notes,
    isLoading,
    save:   saveMutation.mutate,
    remove: deleteMutation.mutate,
  };
}
