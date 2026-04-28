// ── Roadmap-only seed script ──────────────────────────────────────────────────
// Truncates and re-seeds roadmap_phases, roadmap_weeks, roadmap_sessions,
// and roadmap_resources from the TypeScript source files.
//
// Use this instead of npm run seed when you only want to refresh roadmap data
// (e.g. after fixing a link, adding a session, etc.).
//
// Run: npm run seed:roadmap
//
// After running, call POST /api/admin/flush-cache to invalidate the server
// in-memory cache so users see the changes immediately.

import { sql } from "../src/db/client.js";
import { pythonRoadmap } from "../../src/data/roadmap-python.js";
import { javaRoadmap }   from "../../src/data/roadmap-java.js";

async function seedRoadmapLanguage(language: "python" | "java", phases: typeof pythonRoadmap) {
  let phaseCount = 0, weekCount = 0, sessionCount = 0, resourceCount = 0;

  // Delete all existing data for this language (cascade via FK: phases → weeks → sessions → resources)
  // Resources and sessions must be deleted before weeks/phases due to FK constraints.
  const existingPhases = await sql`SELECT id FROM roadmap_phases WHERE language = ${language}` as { id: number }[];
  if (existingPhases.length) {
    const phaseIds = existingPhases.map((p) => p.id);
    const existingWeeks = await sql`SELECT id FROM roadmap_weeks WHERE phase_id = ANY(${phaseIds}::int[])` as { id: number }[];
    if (existingWeeks.length) {
      const weekIds = existingWeeks.map((w) => w.id);
      const existingSessions = await sql`SELECT id FROM roadmap_sessions WHERE week_id = ANY(${weekIds}::int[])` as { id: number }[];
      if (existingSessions.length) {
        const sessionIds = existingSessions.map((s) => s.id);
        await sql`DELETE FROM roadmap_resources WHERE session_id = ANY(${sessionIds}::int[])`;
        await sql`DELETE FROM roadmap_sessions WHERE id = ANY(${sessionIds}::int[])`;
      }
      await sql`DELETE FROM roadmap_weeks WHERE id = ANY(${weekIds}::int[])`;
    }
    await sql`DELETE FROM roadmap_phases WHERE id = ANY(${phaseIds}::int[])`;
  }
  console.log(`  ↻ Cleared existing ${language} roadmap data`);

  for (const phase of phases) {
    const [phaseRow] = await sql`
      INSERT INTO roadmap_phases (language, phase_number, title, icon, accent, light, description)
      VALUES (${language}, ${phase.phase}, ${phase.title}, ${phase.icon}, ${phase.accent}, ${phase.light}, ${phase.desc ?? ""})
      RETURNING id
    ` as { id: number }[];
    const phaseId = phaseRow.id;
    phaseCount++;

    for (const week of phase.weeks) {
      const [weekRow] = await sql`
        INSERT INTO roadmap_weeks (phase_id, week_number, title)
        VALUES (${phaseId}, ${week.n}, ${week.title})
        RETURNING id
      ` as { id: number }[];
      const weekId = weekRow.id;
      weekCount++;

      for (let si = 0; si < week.sessions.length; si++) {
        const session = week.sessions[si];
        const [sessionRow] = await sql`
          INSERT INTO roadmap_sessions (week_id, label, focus, sort_order)
          VALUES (${weekId}, ${session.label}, ${session.focus}, ${si})
          RETURNING id
        ` as { id: number }[];
        const sessionId = sessionRow.id;
        sessionCount++;

        for (let ri = 0; ri < session.resources.length; ri++) {
          const res = session.resources[ri];
          await sql`
            INSERT INTO roadmap_resources (session_id, type, item, where_text, mins, url, sort_order)
            VALUES (
              ${sessionId}, ${res.type}, ${res.item},
              ${res.where}, ${res.mins ?? null}, ${res.url ?? null}, ${ri}
            )
          `;
          resourceCount++;
        }
      }
    }
  }

  console.log(
    `  ✓ roadmap[${language}]: ${phaseCount} phases, ${weekCount} weeks, ${sessionCount} sessions, ${resourceCount} resources`
  );
}

async function main() {
  console.log("▶ Seeding roadmap tables…");
  await seedRoadmapLanguage("python", pythonRoadmap);
  await seedRoadmapLanguage("java",   javaRoadmap);
  console.log("✅ Roadmap seed complete");
  console.log("   Next: POST /api/admin/flush-cache to clear the server cache.");
}

main().catch((err) => {
  console.error("❌ Roadmap seed failed:", err);
  process.exit(1);
});
