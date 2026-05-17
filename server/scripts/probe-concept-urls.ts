// Probe URLs embedded inside concepts.sections JSON.
// Sections schema is flexible; we scan for any string field that looks like a URL.

import "dotenv/config";
import { sql } from "../src/db/client.js";

const TIMEOUT_MS = 25000;
const CONCURRENCY = 6;
const URL_RE = /https?:\/\/[^\s"'<>)]+/g;

async function probe(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    });
    if ([405, 403, 400, 501].includes(res.status)) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      });
    }
    clearTimeout(t);
    return { status: res.status, ok: res.status >= 200 && res.status < 400, reason: res.status >= 200 && res.status < 400 ? "ok" : `http_${res.status}` };
  } catch (e: any) {
    clearTimeout(t);
    const msg = e?.name === "AbortError" ? "timeout" : (e?.cause?.code || e?.code || e?.message || "fetch_error");
    return { status: null, ok: false, reason: String(msg).slice(0, 80) };
  }
}

async function main() {
  const rows = await sql`
    SELECT slug, title, sections::text AS sections_txt
    FROM concepts ORDER BY sort_order, slug
  ` as unknown as Array<{ slug: string; title: string; sections_txt: string }>;

  interface Found { slug: string; title: string; url: string }
  const found: Found[] = [];
  const seenPerConcept = new Map<string, Set<string>>();

  for (const r of rows) {
    const matches = r.sections_txt.match(URL_RE) || [];
    for (const raw of matches) {
      // Strip trailing punctuation that the regex picks up.
      const url = raw.replace(/[.,;:!?\]}\)]+$/, "");
      const set = seenPerConcept.get(r.slug) || new Set<string>();
      if (set.has(url)) continue;
      set.add(url);
      seenPerConcept.set(r.slug, set);
      found.push({ slug: r.slug, title: r.title, url });
    }
  }

  console.log(`Probing ${found.length} URLs from ${rows.length} concepts…`);

  const results: Array<Found & Awaited<ReturnType<typeof probe>>> = [];
  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < found.length) {
      const i = cursor++;
      results[i] = { ...found[i], ...(await probe(found[i].url)) };
    }
  });
  await Promise.all(workers);

  const broken = results.filter((r) => !r.ok);
  console.log(`\nTotal: ${results.length}  ok: ${results.length - broken.length}  broken: ${broken.length}`);
  for (const r of broken) {
    console.log(`  [${r.slug}] (${r.reason}) ${r.title.slice(0, 50)}`);
    console.log(`     ${r.url}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
