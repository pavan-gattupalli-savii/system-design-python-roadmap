// ── Bookmarks API ─────────────────────────────────────────────────────────────
import { apiFetch } from "./client";

export type BookmarkType = "reading" | "experience" | "question" | "roadmap_resource";

// Unresolved — just grouped ID lists. Used for star button state.
export interface BookmarksResponse {
  reading:          string[];
  experience:       string[];
  question:         string[];
  roadmap_resource: string[];
}

// Resolved — includes titles and URLs. Used for BookmarksTab display.
export interface ResolvedBookmarkItem {
  id:    string;
  title: string;
  url:   string | null;
  meta:  string;  // type label / "company · role" / category / "Roadmap"
}
export interface ResolvedBookmarksResponse {
  reading:          ResolvedBookmarkItem[];
  experience:       ResolvedBookmarkItem[];
  question:         ResolvedBookmarkItem[];
  roadmap_resource: ResolvedBookmarkItem[];
}

export function fetchBookmarks(): Promise<BookmarksResponse> {
  return apiFetch<BookmarksResponse>("/api/me/bookmarks");
}

export function fetchResolvedBookmarks(): Promise<ResolvedBookmarksResponse> {
  return apiFetch<ResolvedBookmarksResponse>("/api/me/bookmarks?resolved=true");
}

export function addBookmark(resourceType: BookmarkType, resourceId: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/bookmarks", {
    method: "POST",
    body:   JSON.stringify({ resourceType, resourceId }),
  });
}

export function removeBookmark(resourceType: BookmarkType, resourceId: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/bookmarks", {
    method: "DELETE",
    body:   JSON.stringify({ resourceType, resourceId }),
  });
}
