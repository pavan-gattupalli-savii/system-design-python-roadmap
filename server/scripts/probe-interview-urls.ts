// Probe URLs in answer_docs (community Q&A answer links) and experiences
// (interview experience writeups) tables.

import "dotenv/config";
import { sql } from "../src/db/client.js";

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
    return { status: res.status, ok: res.status >= 200 && res.status < 400, reason: res.status >= 200 && res.status < 400 ? "ok" : `http_${res.status}` };
  } catch (e: any) {
    clearTimeout(t);
    const msg = e?.name === "AbortError" ? "timeout" : (e?.cause?.code || e?.code || e?.message || "fetch_error");
    return { status: null, ok: false, reason: String(msg).slice(0, 80) };
  }
}

async function probeAll<T extends { id: string; url: string }>(rows: T[]) {
  const results: Array<T & Awaited<ReturnType<typeof probe>>> = [];
  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < rows.length) {
      const i = cursor++;
      const probed = await probe(rows[i].url);
      results[i] = { ...rows[i], ...probed };
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const ads = await sql`
    SELECT id, question_id AS qid, label, url
    FROM answer_docs WHERE is_approved = true AND url IS NOT NULL AND url <> ''
    ORDER BY created_at DESC
  ` as unknown as Array<{ id: string; qid: string; label: string; url: string }>;
  const exps = await sql`
    SELECT id, title, url, company, platform
    FROM experiences WHERE is_approved = true AND url IS NOT NULL AND url <> ''
    ORDER BY created_at DESC
  ` as unknown as Array<{ id: string; title: string; url: string; company: string; platform: string }>;

  console.log(`Probing ${ads.length} answer_docs + ${exps.length} experiences URLs…`);

  const [adRes, expRes] = await Promise.all([probeAll(ads), probeAll(exps)]);

  console.log("\n── answer_docs ────────────────────────");
  const adBroken = adRes.filter((r) => !r.ok);
  console.log(`  total: ${adRes.length}  ok: ${adRes.length - adBroken.length}  broken: ${adBroken.length}`);
  for (const r of adBroken) {
    console.log(`  #${r.id.slice(0, 8)} (${r.reason}) ${r.label?.slice(0, 60)}`);
    console.log(`     ${r.url}`);
  }

  console.log("\n── experiences ────────────────────────");
  const expBroken = expRes.filter((r) => !r.ok);
  console.log(`  total: ${expRes.length}  ok: ${expRes.length - expBroken.length}  broken: ${expBroken.length}`);
  for (const r of expBroken) {
    console.log(`  #${r.id.slice(0, 8)} [${r.platform}] (${r.reason}) ${r.title?.slice(0, 60)}`);
    console.log(`     ${r.url}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
