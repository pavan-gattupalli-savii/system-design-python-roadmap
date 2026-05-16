// ── Seed build_specs ───────────────────────────────────────────────────────────
// Walks both language roadmaps and, for every "Build" resource whose `item`
// matches a key in the frontend BUILD_SPECS map, inserts a row keyed by
// (language, resource_key) where resource_key = `${phase}_${weekN}_${si}_${ri}`.
//
// Dry-run by default. Pass --apply to write.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { buildSpecs, roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources } from "../src/db/schema.js";
import { eq, asc, sql } from "drizzle-orm";

// Same key the frontend uses for progress/builds/bookmarks
function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

interface ClientBuildSpec {
  overview: string;
  requirements: string[];
  acceptance: string[];
  diagram?: string;
  hints?: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

async function loadFrontendSpecs(): Promise<Record<string, ClientBuildSpec>> {
  // Dynamic import from the frontend source — single source of truth.
  // Path resolved relative to the `server/` cwd.
  const mod = await import("../../src/data/build-specs.ts");
  return mod.BUILD_SPECS as Record<string, ClientBuildSpec>;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const SPECS = await loadFrontendSpecs();
  console.log(`▶ Seeding build_specs — ${apply ? "APPLY" : "DRY RUN"} (${Object.keys(SPECS).length} client specs)`);

  let matched = 0, unmatched = 0, missingRoadmapBuild = 0;
  const writePayload: { language: "python" | "java"; resourceKey: string; spec: ClientBuildSpec; item: string }[] = [];
  const unmatchedKeys: string[] = [];

  for (const lang of ["python", "java"] as const) {
    const phases = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, lang)).orderBy(asc(roadmapPhases.phaseNumber));
    if (!phases.length) continue;

    const weeks = await db.select().from(roadmapWeeks);
    const sessions = await db.select().from(roadmapSessions).orderBy(asc(roadmapSessions.sortOrder));
    const resources = await db.select().from(roadmapResources).orderBy(asc(roadmapResources.sortOrder));

    const weeksByPhase = new Map<number, typeof weeks>();
    weeks.forEach((w) => { const a = weeksByPhase.get(w.phaseId) ?? []; a.push(w); weeksByPhase.set(w.phaseId, a); });
    const sessionsByWeek = new Map<number, typeof sessions>();
    sessions.forEach((s) => { const a = sessionsByWeek.get(s.weekId) ?? []; a.push(s); sessionsByWeek.set(s.weekId, a); });
    const resourcesBySession = new Map<number, typeof resources>();
    resources.forEach((r) => { const a = resourcesBySession.get(r.sessionId) ?? []; a.push(r); resourcesBySession.set(r.sessionId, a); });

    for (const p of phases) {
      const phWeeks = weeksByPhase.get(p.id) ?? [];
      for (const w of phWeeks) {
        const wSessions = sessionsByWeek.get(w.id) ?? [];
        for (let si = 0; si < wSessions.length; si++) {
          const s = wSessions[si];
          const sResources = resourcesBySession.get(s.id) ?? [];
          for (let ri = 0; ri < sResources.length; ri++) {
            const r = sResources[ri];
            if (r.type !== "Build") continue;
            missingRoadmapBuild++;
            const spec = SPECS[r.item];
            if (!spec) {
              unmatched++;
              if (unmatchedKeys.length < 12) unmatchedKeys.push(`[${lang} p${p.phaseNumber}w${w.weekNumber}] ${r.item.slice(0, 70)}`);
              continue;
            }
            matched++;
            writePayload.push({ language: lang, resourceKey: resId(p.phaseNumber, w.weekNumber, si, ri), spec, item: r.item });
          }
        }
      }
    }
  }

  console.log(`── Match summary ──`);
  console.log(`  Build resources in roadmap: ${missingRoadmapBuild}`);
  console.log(`  Matched to spec:            ${matched}`);
  console.log(`  Unmatched (no spec yet):    ${unmatched}`);
  console.log();
  if (unmatchedKeys.length) {
    console.log(`── Unmatched samples (first ${unmatchedKeys.length}) ──`);
    unmatchedKeys.forEach((k) => console.log(`  ${k}`));
    console.log();
  }

  if (!apply) {
    console.log(`Would upsert ${writePayload.length} rows. Run with --apply to commit.`);
    return;
  }

  console.log(`▶ Upserting ${writePayload.length} rows…`);
  let n = 0;
  for (const { language, resourceKey, spec } of writePayload) {
    await db.insert(buildSpecs)
      .values({
        language,
        resourceKey,
        overview:     spec.overview,
        requirements: spec.requirements,
        acceptance:   spec.acceptance,
        diagram:      spec.diagram ?? null,
        hints:        spec.hints ?? [],
        difficulty:   spec.difficulty,
      })
      .onConflictDoUpdate({
        target: [buildSpecs.language, buildSpecs.resourceKey],
        set: {
          overview:     spec.overview,
          requirements: spec.requirements,
          acceptance:   spec.acceptance,
          diagram:      spec.diagram ?? null,
          hints:        spec.hints ?? [],
          difficulty:   spec.difficulty,
        },
      });
    n++;
    if (n % 20 === 0) console.log(`  ${n}/${writePayload.length}`);
  }
  console.log(`✅ Wrote ${n} build_specs rows`);
  console.log(`   Next: POST /api/admin/flush-cache`);
  // Touch sql import so it isn't tree-shaken away for downstream tooling.
  void sql;
}

main().catch((err) => {
  console.error("❌ Seed build_specs failed:", err);
  process.exit(1);
});
