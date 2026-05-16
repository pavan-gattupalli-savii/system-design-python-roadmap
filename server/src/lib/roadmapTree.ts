// ── Roadmap tree builder ──────────────────────────────────────────────────────
// Shared helpers for assembling the nested phase → week → session → resource
// structure from the four flat tables. Used by both /api/roadmap (full tree
// serialisation) and /api/me/analytics (flatten for per-key joins).
//
// Keeping this in one place prevents the two routes drifting in subtle ways —
// e.g. the build-spec join key, the resId() format, or the default fallbacks
// for optional columns.

import type { InferSelectModel } from "drizzle-orm";
import type { roadmapPhases, roadmapWeeks, roadmapSessions, roadmapResources, buildSpecs } from "../db/schema.js";

type Phase    = InferSelectModel<typeof roadmapPhases>;
type Week     = InferSelectModel<typeof roadmapWeeks>;
type Session  = InferSelectModel<typeof roadmapSessions>;
type Resource = InferSelectModel<typeof roadmapResources>;
type Spec     = InferSelectModel<typeof buildSpecs>;

/** Stable resource key — must match `resId` in `src/utils/stats.ts` on the frontend. */
export function resId(phase: number, weekN: number, si: number, ri: number): string {
  return `${phase}_${weekN}_${si}_${ri}`;
}

export interface RoadmapMaps {
  weeksByPhase:       Map<number, Week[]>;
  sessionsByWeek:     Map<number, Session[]>;
  resourcesBySession: Map<number, Resource[]>;
  specByResourceKey:  Map<string, Spec>;
}

/** Group the four flat lists into lookup maps. specs is optional (analytics doesn't need it). */
export function buildMaps(weeks: Week[], sessions: Session[], resources: Resource[], specs: Spec[] = []): RoadmapMaps {
  const weeksByPhase = new Map<number, Week[]>();
  for (const w of weeks) {
    const arr = weeksByPhase.get(w.phaseId) ?? [];
    arr.push(w);
    weeksByPhase.set(w.phaseId, arr);
  }
  const sessionsByWeek = new Map<number, Session[]>();
  for (const s of sessions) {
    const arr = sessionsByWeek.get(s.weekId) ?? [];
    arr.push(s);
    sessionsByWeek.set(s.weekId, arr);
  }
  const resourcesBySession = new Map<number, Resource[]>();
  for (const r of resources) {
    const arr = resourcesBySession.get(r.sessionId) ?? [];
    arr.push(r);
    resourcesBySession.set(r.sessionId, arr);
  }
  const specByResourceKey = new Map<string, Spec>(specs.map((s) => [s.resourceKey, s]));
  return { weeksByPhase, sessionsByWeek, resourcesBySession, specByResourceKey };
}

/**
 * Build the nested Phase[] response shape used by GET /api/roadmap/:language.
 * Pure function — no DB / network. Callers fetch rows then hand them in.
 */
export function serializePhases(phases: Phase[], maps: RoadmapMaps): unknown[] {
  return phases.map((p) => ({
    phase:    p.phaseNumber,
    title:    p.title,
    icon:     p.icon,
    accent:   p.accent,
    light:    p.light,
    desc:     p.description,
    outcomes: p.outcomes ?? [],
    weeks: (maps.weeksByPhase.get(p.id) ?? []).map((w) => ({
      n:                  w.weekNumber,
      title:              w.title,
      learningObjectives: w.learningObjectives ?? [],
      sessions: (maps.sessionsByWeek.get(w.id) ?? []).map((s, si) => ({
        label:     s.label,
        focus:     s.focus,
        resources: (maps.resourcesBySession.get(s.id) ?? []).map((r, ri) => {
          const key = resId(p.phaseNumber, w.weekNumber, si, ri);
          const spec = r.type === "Build" ? maps.specByResourceKey.get(key) : undefined;
          return {
            type:   r.type,
            item:   r.item,
            where:  r.whereText,
            mins:   r.mins,
            url:    r.url ?? undefined,
            isCore: r.isCore,
            spec:   spec ? {
              overview:      spec.overview,
              requirements:  spec.requirements,
              acceptance:    spec.acceptance,
              diagram:       spec.diagram ?? undefined,
              hints:         spec.hints,
              difficulty:    spec.difficulty,
              stretchGoals:  spec.stretchGoals ?? [],
              pitfalls:      spec.pitfalls ?? [],
              estHours:      spec.estHours ?? 0,
              tags:          spec.tags ?? [],
              prerequisites: spec.prerequisites ?? [],
              references:    spec.references ?? [],
            } : undefined,
          };
        }),
      })),
    })),
  }));
}

/** Flatten every resource into (key, type, mins, estHours, phase, phaseTitle) for analytics-style joins. */
export interface FlatResource {
  key:        string;
  type:       string;
  mins:       number;
  estHours:   number;
  phase:      number;
  phaseTitle: string;
}

export function flattenResources(phases: Phase[], maps: RoadmapMaps): FlatResource[] {
  const out: FlatResource[] = [];
  for (const p of phases) {
    for (const w of maps.weeksByPhase.get(p.id) ?? []) {
      const wSessions = maps.sessionsByWeek.get(w.id) ?? [];
      for (let si = 0; si < wSessions.length; si++) {
        const s = wSessions[si];
        const sRes = maps.resourcesBySession.get(s.id) ?? [];
        for (let ri = 0; ri < sRes.length; ri++) {
          const r = sRes[ri];
          const key = resId(p.phaseNumber, w.weekNumber, si, ri);
          out.push({
            key,
            type:       r.type,
            mins:       r.mins,
            estHours:   maps.specByResourceKey.get(key)?.estHours ?? 0,
            phase:      p.phaseNumber,
            phaseTitle: p.title,
          });
        }
      }
    }
  }
  return out;
}
