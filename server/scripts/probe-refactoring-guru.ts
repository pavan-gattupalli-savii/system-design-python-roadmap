// Deep-probe refactoring.guru URLs in roadmap_resources.
// They return HTTP 200 but render a soft-404 ("Page not found") when the slug
// is wrong, so we have to download the body and grep for the 404 marker.

import "dotenv/config";
import { sql } from "../src/db/client.js";

const TIMEOUT_MS = 25000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

async function fetchBody(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
    });
    clearTimeout(t);
    const body = await res.text();
    return { status: res.status, body, finalUrl: res.url };
  } catch (e: any) {
    clearTimeout(t);
    return { status: null, body: "", finalUrl: url, err: e?.message ?? String(e) };
  }
}

function isSoft404(body: string, url: string): { soft404: boolean; reason: string } {
  const lower = body.toLowerCase();
  // refactoring.guru renders <title>Page Not Found</title> + has "is currently down" or "page does not exist" copy
  if (/<title>[^<]*(page not found|404)[^<]*<\/title>/i.test(body)) {
    return { soft404: true, reason: "404 in <title>" };
  }
  if (lower.includes("page not found") && lower.includes("doesn't exist")) {
    return { soft404: true, reason: "page-not-found copy" };
  }
  // If body is suspiciously short for refactoring.guru
  if (body.length < 2000) {
    return { soft404: true, reason: `body too short (${body.length}b)` };
  }
  return { soft404: false, reason: "" };
}

async function main() {
  const rows = await sql`
    SELECT rr.id, rp.language, rp.phase_number, rw.week_number, rr.item, rr.url
    FROM roadmap_resources rr
    JOIN roadmap_sessions rs ON rs.id = rr.session_id
    JOIN roadmap_weeks rw    ON rw.id = rs.week_id
    JOIN roadmap_phases rp   ON rp.id = rw.phase_id
    WHERE rr.url ILIKE '%refactoring.guru%'
    ORDER BY rp.language, rp.phase_number, rw.week_number
  ` as unknown as Array<{ id: number; language: string; phase_number: number; week_number: number; item: string; url: string }>;

  console.log(`Probing ${rows.length} refactoring.guru URLs (sequential, content-aware)…`);
  const broken: typeof rows = [];
  for (const r of rows) {
    const { status, body, err } = await fetchBody(r.url);
    if (status !== 200) {
      console.log(`  ✗ ${status ?? "ERR"}  [${r.language} p${r.phase_number}w${r.week_number}]  ${r.url}  ${err ?? ""}`);
      broken.push(r);
      continue;
    }
    const { soft404, reason } = isSoft404(body, r.url);
    if (soft404) {
      console.log(`  ✗ soft404 (${reason})  [${r.language} p${r.phase_number}w${r.week_number}]  ${r.url}`);
      broken.push(r);
    } else {
      console.log(`  ✓ 200      [${r.language} p${r.phase_number}w${r.week_number}]  ${r.url}`);
    }
  }
  console.log(`\nTotal: ${rows.length}, broken: ${broken.length}`);
  if (broken.length) {
    const fs = await import("fs");
    fs.writeFileSync("/tmp/refactoring-guru-broken.json", JSON.stringify(broken, null, 2));
    console.log("→ /tmp/refactoring-guru-broken.json");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
