// Probe URLs in the readings table (community-curated reading list).
// Mirrors probe-resource-urls.ts but for the readings entity.

import "dotenv/config";
import { sql } from "../src/db/client.js";

interface Row {
  id: string;
  title: string;
  url: string;
  type: string;
}

const TIMEOUT_MS = 25000;
const CONCURRENCY = 6;

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
    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      reason: res.status >= 200 && res.status < 400 ? "ok" : `http_${res.status}`,
    };
  } catch (e: any) {
    clearTimeout(t);
    const msg = e?.name === "AbortError" ? "timeout" : (e?.cause?.code || e?.code || e?.message || "fetch_error");
    return { status: null, ok: false, reason: String(msg).slice(0, 80) };
  }
}

async function main() {
  const rows = await sql`
    SELECT id, title, url, type
    FROM readings
    WHERE url IS NOT NULL AND url <> '' AND is_approved = true
    ORDER BY created_at DESC
  ` as unknown as Row[];

  console.log(`Probing ${rows.length} readings URLs (concurrency=${CONCURRENCY}, timeout=${TIMEOUT_MS}ms)…`);

  const results: Array<Row & Awaited<ReturnType<typeof probe>>> = [];
  let cursor = 0;
  let done = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < rows.length) {
      const i = cursor++;
      const r = rows[i];
      const probed = await probe(r.url);
      results[i] = { ...r, ...probed };
      done++;
      if (done % 10 === 0) console.log(`  ${done}/${rows.length}`);
    }
  });
  await Promise.all(workers);

  const broken = results.filter((r) => !r.ok);
  console.log("\n── Summary ────────────────────────────");
  console.log(`  total      : ${results.length}`);
  console.log(`  ok         : ${results.length - broken.length}`);
  console.log(`  broken     : ${broken.length}`);

  if (broken.length) {
    console.log("\n── Broken ─────────────────────────────");
    for (const r of broken) {
      console.log(`  #${r.id.slice(0,8)} [${r.type}] (${r.reason}) ${r.title.slice(0, 60)}`);
      console.log(`     ${r.url}`);
    }
  } else {
    console.log("\n✓ All readings URLs reachable.");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
