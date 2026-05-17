// Fix broken roadmap_resources URLs. Dry-run by default; pass --apply to write.
//
// Usage:
//   tsx scripts/fix-broken-resource-urls.ts            # dry-run
//   tsx scripts/fix-broken-resource-urls.ts --apply    # commit updates

import "dotenv/config";
import { sql } from "../src/db/client.js";

const MAPPING: Array<{ from: string; to: string }> = [
  { from: "https://baeldung.com/java-21-new-features",
    to:   "https://www.baeldung.com/java-lts-21-new-features" },
  { from: "https://baeldung.com/spring-boot-auto-configuration",
    to:   "https://www.baeldung.com/spring-boot-custom-auto-configuration" },
  { from: "https://baeldung.com/spring-security-preauthorize",
    to:   "https://www.baeldung.com/spring-security-method-security" },
  { from: "https://baeldung.com/hibernate-batchsize",
    to:   "https://www.baeldung.com/jpa-hibernate-batch-insert-update" },
  { from: "https://baeldung.com/spring-data-jpa-bulk-insert",
    to:   "https://www.baeldung.com/spring-data-jpa-batch-inserts" },
  { from: "https://baeldung.com/spring-boot-docker-compose",
    to:   "https://www.baeldung.com/docker-compose-support-spring-boot" },
  { from: "https://baeldung.com/spring-boot-kubernetes",
    to:   "https://www.baeldung.com/spring-boot-minikube" },
  { from: "https://baeldung.com/spring-cloud-aws",
    to:   "https://www.baeldung.com/spring-cloud-aws-s3" },
  { from: "https://java.testcontainers.org/frameworks/spring_boot/",
    to:   "https://docs.spring.io/spring-boot/reference/testing/testcontainers.html" },
  { from: "https://micrometer.io/docs/observation",
    to:   "https://docs.micrometer.io/micrometer/reference/observation.html" },
  { from: "https://micrometer.io/docs/tracing",
    to:   "https://docs.micrometer.io/tracing/reference/index.html" },
  { from: "https://bytebytego.com/courses/system-design-interview-vol-2",
    to:   "https://bytebytego.com/courses/system-design-interview/foreword" },
  { from: "https://refactoring.guru/solid",
    to:   "https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design" },
  { from: "https://realpython.com/python-tdd-introduction/",
    to:   "https://realpython.com/courses/test-driven-development-pytest/" },
];

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ ${apply ? "APPLY" : "DRY RUN"} — fix broken resource URLs\n`);

  let totalAffected = 0;
  const updates: Array<{ from: string; to: string; rows: number }> = [];

  for (const { from, to } of MAPPING) {
    const matches = await sql`
      SELECT rr.id, rp.language, rp.phase_number, rw.week_number, rr.item
      FROM roadmap_resources rr
      JOIN roadmap_sessions  rs ON rs.id = rr.session_id
      JOIN roadmap_weeks     rw ON rw.id = rs.week_id
      JOIN roadmap_phases    rp ON rp.id = rw.phase_id
      WHERE rr.url = ${from}
    ` as unknown as Array<{ id: number; language: string; phase_number: number; week_number: number; item: string }>;

    updates.push({ from, to, rows: matches.length });
    totalAffected += matches.length;

    console.log(`[${matches.length}] ${from}`);
    console.log(`  →  ${to}`);
    for (const r of matches) {
      console.log(`     • id=${r.id} ${r.language} p${r.phase_number}w${r.week_number} ${r.item.slice(0, 70)}`);
    }
    console.log();
  }

  console.log(`Total rows to update: ${totalAffected}`);

  if (!apply) {
    console.log("\nDry run — pass --apply to write.");
    return;
  }

  console.log("\n▶ Writing…");
  let written = 0;
  for (const { from, to } of MAPPING) {
    const r = await sql`UPDATE roadmap_resources SET url = ${to} WHERE url = ${from}` as unknown as { rowCount?: number };
    const n = (r as any).rowCount ?? 0;
    written += n;
    console.log(`  ${n}  ${from}`);
  }
  console.log(`\n✅ Updated ${written} rows.`);
  console.log("   Next: POST /api/admin/flush-cache to invalidate cache.");
}

main().catch(e => { console.error(e); process.exit(1); });
