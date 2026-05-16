// ── Notes API ─────────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Language } from "../data/roadmap-index";

export interface UserNote {
  resourceKey: string;
  bodyMd:      string;
  updatedAt:   string;
}

export async function fetchNotes(language: Language): Promise<UserNote[]> {
  return apiFetch<UserNote[]>(`/api/me/notes?language=${language}`);
}

export async function saveNote(language: Language, resourceKey: string, bodyMd: string): Promise<{ ok: boolean; deleted?: boolean }> {
  return apiFetch(`/api/me/notes`, {
    method: "POST",
    body:   JSON.stringify({ language, resourceKey, bodyMd }),
  });
}

export async function deleteNote(language: Language, resourceKey: string): Promise<{ ok: boolean }> {
  return apiFetch(`/api/me/notes/${encodeURIComponent(resourceKey)}?language=${language}`, {
    method: "DELETE",
  });
}
