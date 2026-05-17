// Probe every roadmap_resources.url with HEAD (fallback GET) and log broken ones.
// Dry-run: writes report to /tmp/url-probe-report.json. No DB writes here.

import "dotenv/config";
import { sql } from "../src/db/client.js";

interface Row {
  id: number;
  language: string;
  phase_number: number;
  week_number: number;
  type: string;
  item: string;
  url: string;
}

interface Result extends Row {
  status: number | null;
  ok: boolean;
  reason: string;
  finalUrl?: string;
}

const TIMEOUT_MS = 12000;
const CONCURRENCY = 16;

async function probe(url: string): Promise<{ status: number | null; ok: boolean; reason: string; finalUrl?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RoadmapBot/1.0)" },
    });
    // Some sites reject HEAD — retry GET
    if (res.status === 405 || res.status === 403 || res.status === 400) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RoadmapBot/1.0)" },
      });
    }
    clearTimeout(t);
    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      reason: res.status >= 200 && res.status < 400 ? "ok" : `http_${res.status}`,
      finalUrl: res.url,
    };
  } catch (e: any) {
    clearTimeout(t);
    const msg = e?.name === "AbortError" ? "timeout" : (e?.cause?.code || e?.code || e?.message || "fetch_error");
    return { status: null, ok: false, reason: String(msg).slice(0, 80) };
  }
}

async function main() {
  const rows = await sql`
    SELECT rr.id, rp.language, rp.phase_number, rw.week_number,
           rr.type, rr.item, rr.url
    FROM roadmap_resources rr
    JOIN roadmap_sessions  rs ON rs.id = rr.session_id
    JOIN roadmap_weeks     rw ON rw.id = rs.week_id
    JOIN roadmap_phases    rp ON rp.id = rw.phase_id
    WHERE rr.url IS NOT NULL AND rr.url <> ''
    ORDER BY rp.language, rp.phase_number, rw.week_number, rr.id
  ` as unknown as Row[];

  console.log(`Probing ${rows.length} URLs (concurrency=${CONCURRENCY})…`);

  const results: Result[] = [];
  let done = 0;
  let cursor = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < rows.length) {
      const i = cursor++;
      const r = rows[i];
      const probed = await probe(r.url);
      results[i] = { ...r, ...probed };
      done++;
      if (done % 25 === 0) console.log(`  ${done}/${rows.length}`);
    }
  });
  await Promise.all(workers);

  const broken = results.filter(r => !r.ok);
  const byStatus: Record<string, number> = {};
  for (const r of broken) byStatus[r.reason] = (byStatus[r.reason] || 0) + 1;

  console.log("\n── Summary ────────────────────────────");
  console.log(`  total checked : ${results.length}`);
  console.log(`  ok            : ${results.length - broken.length}`);
  console.log(`  broken        : ${broken.length}`);
  console.log("\n── Broken by reason ───────────────────");
  Object.entries(byStatus).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(`  ${k.padEnd(20)} ${v}`));

  console.log("\n── Broken by language ─────────────────");
  const byLang: Record<string, number> = {};
  for (const r of broken) byLang[r.language] = (byLang[r.language] || 0) + 1;
  Object.entries(byLang).forEach(([k,v])=>console.log(`  ${k.padEnd(10)} ${v}`));

  console.log("\n── First 30 broken samples ────────────");
  for (const r of broken.slice(0, 30)) {
    console.log(`  [${r.language} p${r.phase_number}w${r.week_number}] (${r.reason}) ${r.type} ${r.item.slice(0,60)}`);
    console.log(`     ${r.url}`);
  }

  const fs = await import("fs");
  fs.writeFileSync("/tmp/url-probe-report.json", JSON.stringify(broken, null, 2));
  console.log(`\n✅ Broken list → /tmp/url-probe-report.json (${broken.length} rows)`);
}

main().catch(e => { console.error(e); process.exit(1); });
