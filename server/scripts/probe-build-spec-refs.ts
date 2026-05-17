import "dotenv/config";
import { sql } from "../src/db/client.js";

const TIMEOUT_MS = 12000;

async function probe(url: string) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    if (r.status === 405 || r.status === 403 || r.status === 400) {
      r = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    }
    clearTimeout(t);
    return { ok: r.status >= 200 && r.status < 400, status: r.status };
  } catch (e: any) {
    clearTimeout(t);
    return { ok: false, status: null, err: e?.message ?? String(e) };
  }
}

async function main() {
  const rows = await sql`SELECT id, language, resource_key, "references" AS refs FROM build_specs` as unknown as Array<{ id: number; language: string; resource_key: string; refs: any }>;
  type Found = { specId: number; language: string; resourceKey: string; label?: string; url: string };
  const all: Found[] = [];
  for (const s of rows) {
    if (!Array.isArray(s.refs)) continue;
    for (const ref of s.refs) {
      if (ref && typeof ref === "object" && typeof ref.url === "string" && ref.url.startsWith("http")) {
        all.push({ specId: s.id, language: s.language, resourceKey: s.resource_key, label: ref.label ?? ref.title, url: ref.url });
      }
    }
  }
  console.log(`build_specs.references URLs: ${all.length}`);
  const broken: Array<Found & { status: number | null; err?: string }> = [];
  let i = 0;
  const C = 16;
  await Promise.all(Array.from({ length: C }, async () => {
    while (i < all.length) {
      const idx = i++;
      const u = all[idx];
      const r = await probe(u.url);
      if (!r.ok) broken.push({ ...u, status: r.status, err: (r as any).err });
      if (idx % 25 === 0) console.log(`  ${idx}/${all.length}`);
    }
  }));
  console.log(`\nbroken: ${broken.length}`);
  for (const b of broken.slice(0, 50)) {
    console.log(`  [${b.language}] ${b.resourceKey} (${b.status ?? b.err}) ${b.label}`);
    console.log(`     ${b.url}`);
  }
  const fs = await import("fs");
  fs.writeFileSync("/tmp/buildspec-broken.json", JSON.stringify(broken, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
