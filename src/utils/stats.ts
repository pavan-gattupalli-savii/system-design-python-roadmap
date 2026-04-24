import type { Phase, WeekWithPhase, ColorScheme } from "../data/models";

/** Unique, stable ID for each resource — used as the sessionStorage progress key. */
export const resId = (phase: number, weekN: number, si: number, ri: number): string =>
  `${phase}_${weekN}_${si}_${ri}`;

/** All weeks flattened across all phases, each enriched with phase metadata. */
export function getAllWeeks(roadmap: Phase[]): WeekWithPhase[] {
  return roadmap.flatMap((p) =>
    p.weeks.map((w) => ({ ...w, phase: p.phase, accent: p.accent, light: p.light }))
  );
}

/** Maps a session label to its badge colour scheme. */
export function sessionColors(label: string): ColorScheme {
  if (label.startsWith("Build")) return { color: "#c4b5fd", bg: "#1a0a3b", border: "#3b1f7b" };
  if (label === "Practice")      return { color: "#f9a8d4", bg: "#3b0f1a", border: "#7f1d3b" };
  if (label === "Review")        return { color: "#fde68a", bg: "#2a1f00", border: "#78350f" };
  return                                { color: "#6ee7b7", bg: "#0f2a18", border: "#1a4d2e" };
}

/** Returns { total, done, pct } for a given phase using the current completion Set. */
export function getPhaseStats(
  p: Phase,
  completed: Set<string>
): { total: number; done: number; pct: number } {
  let total = 0, done = 0;
  p.weeks.forEach((w) => {
    w.sessions.forEach((s, si) => {
      s.resources.forEach((_, ri) => {
        total++;
        if (completed.has(resId(p.phase, w.n, si, ri))) done++;
      });
    });
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}
