// ── Seed concept_week_links ────────────────────────────────────────────────────
// For every concept, find roadmap weeks whose title (lowercased) contains any
// of the concept's `roadmap_keywords` and insert one link per match.
//
// Dry-run by default. Pass --apply to write.

import "dotenv/config";
import { db, sql } from "../src/db/client.js";
import { concepts, conceptWeekLinks, roadmapPhases, roadmapWeeks } from "../src/db/schema.js";
import { eq, asc } from "drizzle-orm";

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(`▶ Seeding concept_week_links — ${apply ? "APPLY" : "DRY RUN"}`);

  const allConcepts = await db.select().from(concepts).orderBy(asc(concepts.sortOrder));

  const links: { conceptSlug: string; language: "python" | "java"; phaseNumber: number; weekNumber: number; weekTitle: string }[] = [];

  for (const lang of ["python", "java"] as const) {
    const phases = await db.select().from(roadmapPhases).where(eq(roadmapPhases.language, lang));
    const weeks  = await db.select().from(roadmapWeeks);
    const phaseById = new Map(phases.map((p) => [p.id, p]));

    for (const w of weeks) {
      const phase = phaseById.get(w.phaseId);
      if (!phase || phase.language !== lang) continue;
      const titleLower = w.title.toLowerCase();
      for (const c of allConcepts) {
        if (!c.roadmapKeywords.length) continue;
        // Word-boundary match — avoids "protocols" → "Protocols & ABCs" false positive
        // that the older substring matcher produced. \b inside a dynamic RegExp would
        // require escaping; lightweight tokenize-and-compare is enough here.
        const tokens = titleLower.split(/[^a-z0-9]+/).filter(Boolean);
        const tokenSet = new Set(tokens);
        const hit = c.roadmapKeywords.some((kw) => {
          const kwLower = kw.toLowerCase().trim();
          if (!kwLower) return false;
          // Multi-word keyword: require all tokens of the keyword to be present in the title token list.
          const kwTokens = kwLower.split(/[^a-z0-9]+/).filter(Boolean);
          if (kwTokens.length === 0) return false;
          if (kwTokens.length === 1) return tokenSet.has(kwTokens[0]);
          return kwTokens.every((t) => tokenSet.has(t));
        });
        if (hit) {
          links.push({
            conceptSlug: c.slug,
            language: lang,
            phaseNumber: phase.phaseNumber,
            weekNumber: w.weekNumber,
            weekTitle: w.title,
          });
        }
      }
    }
  }

  console.log(`  Generated ${links.length} links`);

  const byConcept: Record<string, number> = {};
  for (const l of links) byConcept[l.conceptSlug] = (byConcept[l.conceptSlug] || 0) + 1;
  console.log(`  Concepts with ≥1 link: ${Object.keys(byConcept).length} / ${allConcepts.length}`);

  if (!apply) {
    console.log();
    console.log("── Top 10 sample links ──");
    for (const l of links.slice(0, 10)) {
      console.log(`  ${l.conceptSlug.padEnd(22)} → [${l.language}] p${l.phaseNumber} w${l.weekNumber}  "${l.weekTitle}"`);
    }
    return;
  }

  // Wipe + reinsert (idempotent)
  await sql`DELETE FROM concept_week_links`;
  console.log("  ↻ cleared existing links");

  let n = 0;
  for (const l of links) {
    await db.insert(conceptWeekLinks).values({
      conceptSlug:  l.conceptSlug,
      language:     l.language,
      phaseNumber:  l.phaseNumber,
      weekNumber:   l.weekNumber,
    }).onConflictDoNothing();
    n++;
  }
  console.log(`✅ Wrote ${n} concept_week_links rows`);
}

main().catch((err) => {
  console.error("❌ Seed concept_week_links failed:", err);
  process.exit(1);
});
