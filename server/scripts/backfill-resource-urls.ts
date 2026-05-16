// ── Backfill roadmap_resources.url ────────────────────────────────────────────
// Ports the client-side `getResourceUrl` heuristic to the server and computes a
// URL for every row whose `url` column is NULL. Dry-run by default — pass
// `--apply` to actually write the rows.
//
// Usage:
//   tsx scripts/backfill-resource-urls.ts            # dry-run
//   tsx scripts/backfill-resource-urls.ts --apply    # write rows
//   tsx scripts/backfill-resource-urls.ts --sample 20  # show 20 samples (dry-run)

import "dotenv/config";
import { sql } from "../src/db/client.js";

interface ResourceRow {
  id:        number;
  type:      string;
  item:      string;
  where_text: string;
  url:       string | null;
}

interface ResolvedRow {
  id:     number;
  type:   string;
  item:   string;
  where:  string;
  url:    string | null;
  source: ResolutionSource;
}

type ResolutionSource =
  | "existing"
  | "where_http"
  | "youtube_where_search"
  | "realpython_where_search"
  | "google_where_search"
  | "where_domain"
  | "item_youtube_search"
  | "item_book"
  | "unresolved";

const BOOK_URLS: Record<string, string> = {
  "Fluent Python":              "https://elmoukrie.com/wp-content/uploads/2022/05/luciano-ramalho-fluent-python_-clear-concise-and-effective-programming-oreilly-media-2022.pdf",
  "DDIA":                       "https://dataintensive.net/",
  "Google SRE Book":            "https://sre.google/sre-book/table-of-contents/",
  "Effective Java":             "https://www.oreilly.com/library/view/effective-java-3rd/9780134686097/",
  "Head First Design Patterns": "https://www.oreilly.com/library/view/head-first-design/9781492077992/",
  "Java Concurrency in Practice": "https://jcip.net/",
  "System Design Interview Vol 1": "https://bytebytego.com/courses/system-design-interview",
  "System Design Interview Vol 2": "https://bytebytego.com/courses/system-design-interview-vol-2",
};

/** Mirror of src/utils/url.ts `resolveUrl` (where-text → URL). */
function resolveFromWhere(where: string | undefined | null): { url: string; source: ResolutionSource } | null {
  if (!where) return null;
  if (where.startsWith("http")) return { url: where, source: "where_http" };

  const yt = where.match(/YouTube\s*→\s*search\s*['"]([^'"]*?)['"]\s*/i);
  if (yt) return {
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(yt[1])}`,
    source: "youtube_where_search",
  };

  const rp = where.match(/realpython\.com\s*→\s*search\s*'([^']+)'/i);
  if (rp) return {
    url: `https://realpython.com/search?q=${encodeURIComponent(rp[1])}`,
    source: "realpython_where_search",
  };

  const gs = where.match(/^[Ss]earch:?\s+'([^']+)'/);
  if (gs) return {
    url: `https://www.google.com/search?q=${encodeURIComponent(gs[1])}`,
    source: "google_where_search",
  };

  const dm = where.match(/^([a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s]*)?)/i);
  if (dm) return { url: `https://${dm[1]}`, source: "where_domain" };

  return null;
}

/** Mirror of `getResourceUrl` — DB url wins, else where, else item-based. */
function resolveRow(row: ResourceRow): ResolvedRow {
  if (row.url) {
    return { id: row.id, type: row.type, item: row.item, where: row.where_text, url: row.url, source: "existing" };
  }

  const fromWhere = resolveFromWhere(row.where_text);
  if (fromWhere) {
    return { id: row.id, type: row.type, item: row.item, where: row.where_text, ...fromWhere };
  }

  if (row.type === "YouTube") {
    const m = row.item.match(/^Search:\s*'([^']+)'/i);
    if (m) {
      return {
        id: row.id, type: row.type, item: row.item, where: row.where_text,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(m[1])}`,
        source: "item_youtube_search",
      };
    }
  }

  if (row.type === "Book") {
    for (const [key, url] of Object.entries(BOOK_URLS)) {
      if (row.item.includes(key)) {
        return { id: row.id, type: row.type, item: row.item, where: row.where_text, url, source: "item_book" };
      }
    }
  }

  return { id: row.id, type: row.type, item: row.item, where: row.where_text, url: null, source: "unresolved" };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const sampleIdx = args.indexOf("--sample");
  const sampleN = sampleIdx >= 0 ? parseInt(args[sampleIdx + 1] ?? "20", 10) : 10;

  console.log(`▶ Backfill roadmap_resources.url — ${apply ? "APPLY (writing rows)" : "DRY RUN (no writes)"}`);
  console.log();

  const rows = await sql`
    SELECT id, type, item, where_text, url
    FROM roadmap_resources
    ORDER BY id
  ` as unknown as ResourceRow[];

  const resolved: ResolvedRow[] = rows.map(resolveRow);

  // ── Breakdown by source ────────────────────────────────────────────────────
  const bySource: Record<string, number> = {};
  const byTypeSource: Record<string, Record<string, number>> = {};
  let willWrite = 0;
  for (const r of resolved) {
    bySource[r.source] = (bySource[r.source] || 0) + 1;
    byTypeSource[r.type] ??= {};
    byTypeSource[r.type][r.source] = (byTypeSource[r.type][r.source] || 0) + 1;
    if (r.source !== "existing" && r.source !== "unresolved") willWrite++;
  }

  console.log("── Resolution breakdown ───────────────────────");
  Object.entries(bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([src, n]) => console.log(`  ${src.padEnd(28)} ${n}`));
  console.log(`  ${"TOTAL".padEnd(28)} ${resolved.length}`);
  console.log();

  console.log("── By type ────────────────────────────────────");
  Object.entries(byTypeSource)
    .sort((a, b) => Object.values(b[1]).reduce((s, n) => s + n, 0) - Object.values(a[1]).reduce((s, n) => s + n, 0))
    .forEach(([type, counts]) => {
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      const unresolved = counts.unresolved ?? 0;
      const flag = unresolved > 0 ? ` ⚠ ${unresolved} unresolved` : "";
      console.log(`  ${type.padEnd(12)} total=${total}${flag}  ${JSON.stringify(counts)}`);
    });
  console.log();

  // ── Unresolved samples ─────────────────────────────────────────────────────
  const unresolvedRows = resolved.filter((r) => r.source === "unresolved");
  if (unresolvedRows.length > 0) {
    console.log(`── Unresolved samples (showing min(${sampleN}, ${unresolvedRows.length})) ──`);
    for (const r of unresolvedRows.slice(0, sampleN)) {
      console.log(`  [${r.type}] ${r.item.slice(0, 70)}`);
      console.log(`     where: ${r.where.slice(0, 100)}`);
    }
    console.log();
  }

  // ── Resolved samples (one per source) ──────────────────────────────────────
  console.log("── Sample resolved (one per source) ───────────");
  const seenSources = new Set<string>();
  for (const r of resolved) {
    if (r.source === "existing" || r.source === "unresolved") continue;
    if (seenSources.has(r.source)) continue;
    seenSources.add(r.source);
    console.log(`  [${r.source}] ${r.item.slice(0, 60)}`);
    console.log(`     → ${r.url}`);
  }
  console.log();

  // ── Apply ──────────────────────────────────────────────────────────────────
  if (!apply) {
    console.log(`Would write ${willWrite} rows. Run with --apply to commit.`);
    return;
  }

  console.log(`▶ Writing ${willWrite} URLs…`);
  let written = 0;
  for (const r of resolved) {
    if (r.source === "existing" || r.source === "unresolved" || !r.url) continue;
    await sql`UPDATE roadmap_resources SET url = ${r.url} WHERE id = ${r.id}`;
    written++;
    if (written % 50 === 0) console.log(`  ${written}/${willWrite}`);
  }
  console.log(`✅ Wrote ${written} URLs`);
  console.log("   Next: POST /api/admin/flush-cache to invalidate server cache");
}

main().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});
