import { BOOK_URLS } from "../data/books";
import type { Resource } from "../data/models";

/**
 * Converts a raw "where" string into a clickable URL, or returns null.
 * Patterns handled:
 *   "YouTube → search 'X'"          → youtube.com/results?search_query=X
 *   "realpython.com → search 'X'"   → realpython.com/search?q=X
 *   "Search: 'X'" (at line start)   → google.com/search?q=X
 *   "domain.com/path — description" → https://domain.com/path
 */
export function resolveUrl(where: string | undefined): string | null {
  if (!where) return null;
  if (where.startsWith("http")) return where;

  const yt = where.match(/YouTube\s*→\s*search\s*['"]([^'"]*?)['"]\s*/i);
  if (yt) return `https://www.youtube.com/results?search_query=${encodeURIComponent(yt[1])}`;

  const rp = where.match(/realpython\.com\s*→\s*search\s*'([^']+)'/i);
  if (rp) return `https://realpython.com/search?q=${encodeURIComponent(rp[1])}`;

  const gs = where.match(/^[Ss]earch:?\s+'([^']+)'/);
  if (gs) return `https://www.google.com/search?q=${encodeURIComponent(gs[1])}`;

  const dm = where.match(/^([a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s]*)?)/i);
  if (dm) return `https://${dm[1]}`;

  return null;
}

/** Returns the best clickable URL for a resource card. */
export function getResourceUrl(res: Resource): string | null {
  if (res.url) return res.url;

  const fromWhere = resolveUrl(res.where);
  if (fromWhere) return fromWhere;

  if (res.type === "YouTube") {
    const m = res.item.match(/^Search:\s*'([^']+)'/i);
    if (m) return `https://www.youtube.com/results?search_query=${encodeURIComponent(m[1])}`;
  }

  if (res.type === "Book") {
    for (const [key, url] of Object.entries(BOOK_URLS)) {
      if (res.item.includes(key)) return url;
    }
  }

  return null;
}
