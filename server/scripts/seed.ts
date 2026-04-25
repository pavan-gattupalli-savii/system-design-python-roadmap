// ── Database seed script ──────────────────────────────────────────────────────
// Reads all static TypeScript data files and inserts into Neon DB.
// Safe to re-run: uses ON CONFLICT DO NOTHING for all inserts.
//
// Run: npm run seed
//
// NOTE: This script imports from ../../src/data/ using tsx's TypeScript support.
// The static data files remain as source of truth for seeding only.

import { sql } from "../src/db/client.js";
import { READINGS } from "../../src/data/readings.js";
import { INTERVIEWS, EXPERIENCES } from "../../src/data/interviews.js";
import { pythonRoadmap } from "../../src/data/roadmap-python.js";
import { javaRoadmap } from "../../src/data/roadmap-java.js";

// ── Seed readings ─────────────────────────────────────────────────────────────
async function seedReadings() {
  let count = 0;
  for (const r of READINGS) {
    await sql`
      INSERT INTO readings (id, type, title, url, added_by, github_user, topics, difficulty, upvotes, added_on, notes, is_approved)
      VALUES (
        ${r.id}, ${r.type}, ${r.title}, ${r.url}, ${r.addedBy},
        ${r.githubUser ?? null}, ${r.topics}, ${r.difficulty ?? null},
        ${r.upvotes}, ${r.addedOn}, ${r.notes ?? null}, true
      )
      ON CONFLICT (id) DO NOTHING
    `;
    count++;
  }
  // Reset sequence to max id so future inserts don't conflict
  await sql`SELECT setval('readings_id_seq', (SELECT MAX(id) FROM readings))`;
  console.log(`  ✓ readings: ${count} rows`);
}

// ── Seed interview questions + answer docs ────────────────────────────────────
async function seedInterviews() {
  let qCount = 0;
  let aCount = 0;
  for (const q of INTERVIEWS) {
    await sql`
      INSERT INTO interview_questions (id, category, title, difficulty, companies, topics, hints, follow_ups, added_on, is_approved)
      VALUES (
        ${q.id}, ${q.category}, ${q.title}, ${q.difficulty},
        ${q.companies}, ${q.topics}, ${q.hints},
        ${q.followUps ?? []}, ${q.addedOn}, true
      )
      ON CONFLICT (id) DO NOTHING
    `;
    qCount++;

    if (q.answerDocs) {
      for (const doc of q.answerDocs) {
        await sql`
          INSERT INTO answer_docs (question_id, label, url, by, added_on, is_approved)
          VALUES (${q.id}, ${doc.label}, ${doc.url}, ${doc.by}, ${doc.addedOn}, true)
          ON CONFLICT DO NOTHING
        `;
        aCount++;
      }
    }
  }
  await sql`SELECT setval('interview_questions_id_seq', (SELECT MAX(id) FROM interview_questions))`;
  console.log(`  ✓ interview_questions: ${qCount} rows, answer_docs: ${aCount} rows`);
}

// ── Seed experiences ──────────────────────────────────────────────────────────
async function seedExperiences() {
  let count = 0;
  for (const e of EXPERIENCES) {
    await sql`
      INSERT INTO experiences (id, title, url, platform, company, role, outcome, topics, notes, upvotes, added_by, github_user, added_on, is_approved)
      VALUES (
        ${e.id}, ${e.title}, ${e.url}, ${e.platform}, ${e.company},
        ${e.role}, ${e.outcome ?? null}, ${e.topics}, ${e.notes ?? null},
        ${e.upvotes}, ${e.addedBy}, ${e.githubUser ?? null}, ${e.addedOn}, true
      )
      ON CONFLICT (id) DO NOTHING
    `;
    count++;
  }
  await sql`SELECT setval('experiences_id_seq', (SELECT MAX(id) FROM experiences))`;
  console.log(`  ✓ experiences: ${count} rows`);
}

// ── Seed roadmap (phases → weeks → sessions → resources) ─────────────────────
async function seedRoadmapLanguage(language: "python" | "java", phases: typeof pythonRoadmap) {
  let phaseCount = 0, weekCount = 0, sessionCount = 0, resourceCount = 0;

  for (const phase of phases) {
    // Insert phase
    const [phaseRow] = await sql`
      INSERT INTO roadmap_phases (language, phase_number, title, icon, accent, light, description)
      VALUES (${language}, ${phase.phase}, ${phase.title}, ${phase.icon}, ${phase.accent}, ${phase.light}, ${phase.desc ?? ""})
      ON CONFLICT (language, phase_number) DO UPDATE
        SET title = EXCLUDED.title,
            icon  = EXCLUDED.icon
      RETURNING id
    ` as { id: number }[];
    const phaseId = phaseRow.id;
    phaseCount++;

    for (const week of phase.weeks) {
      // Insert week
      const [weekRow] = await sql`
        INSERT INTO roadmap_weeks (phase_id, week_number, title)
        VALUES (${phaseId}, ${week.n}, ${week.title})
        ON CONFLICT (phase_id, week_number) DO UPDATE
          SET title = EXCLUDED.title
        RETURNING id
      ` as { id: number }[];
      const weekId = weekRow.id;
      weekCount++;

      for (let si = 0; si < week.sessions.length; si++) {
        const session = week.sessions[si];
        // Insert session
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
            VALUES (${sessionId}, ${res.type}, ${res.item}, ${res.where}, ${res.mins}, ${res.url ?? null}, ${ri})
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

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("▶ Seeding database…");
  await seedReadings();
  await seedInterviews();
  await seedExperiences();
  await seedRoadmapLanguage("python", pythonRoadmap);
  await seedRoadmapLanguage("java", javaRoadmap);
  console.log("✅ Seed complete");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
