// ── Bootstrap route ───────────────────────────────────────────────────────────
// One-shot endpoint that returns everything the SPA needs on first paint:
// - the full roadmap for the requested language
// - the top 50 readings (sorted by upvotes)
// - the top 50 interview questions (sorted by difficulty)
// - the top 50 experiences (sorted by upvotes)
//
// Doing this in a single request eliminates the parallel-fetch waterfall and
// keeps the cold-start cost paid only once. Result is response-cached for 60s.

import { Router } from "express";
import { db, cached } from "../db/client.js";
import { readings, interviewQuestions, answerDocs, experiences, users } from "../db/schema.js";
import { eq, desc, asc, sql } from "drizzle-orm";
import { sendCached } from "../middleware/cache.js";
import { buildRoadmap } from "./roadmap.js";

const router = Router();


router.get("/", async (req, res) => {
  const language = (req.query.lang === "java" ? "java" : "python") as "python" | "java";

  try {
    const [roadmap, readingsData, interviewsData, experiencesData] = await Promise.all([
      buildRoadmap(language),

      cached("bootstrap:readings", async () => {
        const rows = await db
          .select({
            id: readings.id, type: readings.type, title: readings.title, url: readings.url,
            topics: readings.topics, difficulty: readings.difficulty,
            upvotes: readings.upvotes, addedOn: readings.addedOn, notes: readings.notes,
            displayName: users.displayName, github: users.github, linkedin: users.linkedin,
          })
          .from(readings)
          .leftJoin(users, eq(readings.submittedBy, users.id))
          .where(eq(readings.isApproved, true))
          .orderBy(desc(readings.upvotes), desc(readings.id))
          .limit(50);
        return rows.map((r) => ({
          id:         r.id,
          type:       r.type,
          title:      r.title,
          url:        r.url,
          addedBy:    r.displayName ?? "Maintainer",
          githubUser: r.github ?? undefined,
          linkedin:   r.linkedin ?? undefined,
          topics:     r.topics,
          difficulty: r.difficulty ?? undefined,
          upvotes:    r.upvotes,
          addedOn:    r.addedOn,
          notes:      r.notes ?? undefined,
        }));
      }),

      cached("bootstrap:interviews", async () => {
        // Fetch questions and their answer_docs in two queries, merge in JS
        const questions = await db
          .select()
          .from(interviewQuestions)
          .where(eq(interviewQuestions.isApproved, true))
          .orderBy(
            asc(sql`CASE ${interviewQuestions.difficulty} WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END`),
            desc(interviewQuestions.id),
          )
          .limit(50);

        const qIds = questions.map((q) => q.id);
        const answers = qIds.length
          ? await db
              .select({
                questionId:  answerDocs.questionId,
                id:          answerDocs.id,
                label:       answerDocs.label,
                url:         answerDocs.url,
                addedOn:     answerDocs.addedOn,
                createdAt:   answerDocs.createdAt,
                displayName: users.displayName,
                github:      users.github,
              })
              .from(answerDocs)
              .leftJoin(users, eq(answerDocs.submittedBy, users.id))
              .where(eq(answerDocs.isApproved, true))
          : [];

        const answersByQ = new Map<number, typeof answers>();
        for (const a of answers) {
          if (!qIds.includes(a.questionId)) continue;
          const arr = answersByQ.get(a.questionId) ?? [];
          arr.push(a);
          answersByQ.set(a.questionId, arr);
        }

        return questions.map((q) => ({
          id:         q.id,
          category:   q.category,
          title:      q.title,
          difficulty: q.difficulty,
          companies:  q.companies,
          topics:     q.topics,
          hints:      q.hints,
          followUps:  q.followUps,
          addedOn:    q.addedOn,
          answerDocs: (answersByQ.get(q.id) ?? []).map((a) => ({
            id:      a.id,
            label:   a.label,
            url:     a.url,
            by:      a.displayName ?? "Maintainer",
            github:  a.github,
            addedOn: a.addedOn,
          })),
        }));
      }),

      cached("bootstrap:experiences", async () => {
        const rows = await db
          .select({
            id: experiences.id, title: experiences.title, url: experiences.url,
            platform: experiences.platform, company: experiences.company, role: experiences.role,
            outcome: experiences.outcome, topics: experiences.topics, notes: experiences.notes,
            upvotes: experiences.upvotes, addedOn: experiences.addedOn,
            displayName: users.displayName, github: users.github, linkedin: users.linkedin,
          })
          .from(experiences)
          .leftJoin(users, eq(experiences.submittedBy, users.id))
          .where(eq(experiences.isApproved, true))
          .orderBy(desc(experiences.upvotes), desc(experiences.id))
          .limit(50);
        return rows.map((e) => ({
          id:         e.id,
          title:      e.title,
          url:        e.url,
          platform:   e.platform,
          company:    e.company,
          role:       e.role,
          outcome:    e.outcome ?? undefined,
          topics:     e.topics,
          notes:      e.notes ?? undefined,
          upvotes:    e.upvotes,
          addedBy:    e.displayName ?? "Maintainer",
          githubUser: e.github ?? undefined,
          linkedin:   e.linkedin ?? undefined,
          addedOn:    e.addedOn,
        }));
      }),
    ]);

    sendCached(res, req, { roadmap, readings: readingsData, interviews: interviewsData, experiences: experiencesData, language });
  } catch (err) {
    console.error("bootstrap error:", err);
    res.status(500).json({ error: "Failed to load bootstrap payload" });
  }
});

export default router;
