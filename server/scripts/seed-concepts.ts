// ── Seed concepts ──────────────────────────────────────────────────────────────
// Pulls concept content from the frontend CONCEPTS array and writes it to the
// `concepts` table. Each row stores `sections` as JSONB. Dynamic SVG diagrams
// remain client-only; the DB stores only the diagram *key* (string).
//
// Dry-run by default. Pass --apply to write.

import "dotenv/config";
import { db } from "../src/db/client.js";
import { concepts as conceptsTable } from "../src/db/schema.js";

async function main() {
  const apply = process.argv.includes("--apply");

  // Load the frontend registry — single source of truth for concept content.
  const mod = await import("../../src/data/concepts/index.ts") as {
    CONCEPTS: Array<{
      slug: string;
      title: string;
      emoji: string;
      category: string;
      tagline: string;
      sections: unknown[];
      related?: string[];
      roadmapKeywords?: string[];
    }>;
  };
  const CONCEPTS = mod.CONCEPTS;

  console.log(`▶ Seeding concepts — ${apply ? "APPLY" : "DRY RUN"} (${CONCEPTS.length} concepts)`);

  if (!apply) {
    for (const c of CONCEPTS.slice(0, 5)) {
      console.log(`  ${c.emoji} ${c.title.padEnd(28)} (${c.category}) sections=${c.sections.length} keywords=${c.roadmapKeywords?.length ?? 0}`);
    }
    console.log(`  …(${CONCEPTS.length - 5} more)`);
    console.log();
    console.log(`Would upsert ${CONCEPTS.length} rows. Run with --apply to commit.`);
    return;
  }

  console.log(`▶ Upserting ${CONCEPTS.length} rows…`);
  for (let i = 0; i < CONCEPTS.length; i++) {
    const c = CONCEPTS[i];
    await db
      .insert(conceptsTable)
      .values({
        slug:             c.slug,
        title:            c.title,
        emoji:            c.emoji,
        category:         c.category,
        tagline:          c.tagline,
        sections:         c.sections,
        related:          c.related ?? [],
        roadmapKeywords:  c.roadmapKeywords ?? [],
        sortOrder:        i,
      })
      .onConflictDoUpdate({
        target: conceptsTable.slug,
        set: {
          title:            c.title,
          emoji:            c.emoji,
          category:         c.category,
          tagline:          c.tagline,
          sections:         c.sections,
          related:          c.related ?? [],
          roadmapKeywords:  c.roadmapKeywords ?? [],
          sortOrder:        i,
        },
      });
  }
  console.log(`✅ Wrote ${CONCEPTS.length} concepts`);
}

main().catch((err) => {
  console.error("❌ Seed concepts failed:", err);
  process.exit(1);
});
