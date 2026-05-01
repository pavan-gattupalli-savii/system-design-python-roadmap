// ── DOMAIN MODELS ──────────────────────────────────────────────────────────────
// Shared TypeScript interfaces for the roadmap data structures.
// Import from here in hooks, utils, and components for consistent typing.

export interface BuildSpec {
  overview: string;
  requirements: string[];
  acceptance: string[];
  diagram?: string;
  hints?: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface Resource {
  type: string;
  item: string;
  where: string;
  mins: number;
  url?: string;
}

export interface Session {
  label: string;
  focus: string;
  resources: Resource[];
}

export interface Week {
  n: number;
  title: string;
  sessions: Session[];
}

export interface Phase {
  phase: number;
  title: string;
  icon: string;
  accent: string;
  light: string;
  desc: string;
  weeks: Week[];
}

/** Week enriched with its parent phase metadata (from allWeeks flat list). */
export interface WeekWithPhase extends Week {
  phase: number;
  accent: string;
  light: string;
}

export interface TypeStyle {
  bg: string;
  tx: string;
  icon: string;
}

export interface Channel {
  name: string;
  url: string;
  desc: string;
}

export interface Tab {
  id: string;
  label: string;
}

export interface ColorScheme {
  color: string;
  bg: string;
  border: string;
}
