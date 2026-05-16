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
  /** Bonus extensions to attempt after the core spec is shipped. */
  stretchGoals?: string[];
  /** Common mistakes and anti-patterns to avoid. */
  pitfalls?: string[];
  /** Estimated real-world build effort in hours. */
  estHours?: number;
  /** Short labels for filtering ("LLD", "Spring", "Concurrency"). */
  tags?: string[];
  /** Things to know first — concept slugs or human-readable refs. */
  prerequisites?: string[];
  /** Curated external links — articles, videos, docs. */
  references?: Array<{ label: string; url: string }>;
}

export interface Resource {
  type: string;
  item: string;
  where: string;
  mins: number;
  url?: string;
  /** When true, resource is required for phase progression. Defaults true. */
  isCore?: boolean;
  /** Build resources only — rich spec loaded from `build_specs`. */
  spec?: BuildSpec;
  /** Server-side keyword-matched concept for the 📖 cross-link chip. */
  linkedConcept?: { slug: string; title: string; emoji: string };
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
  /** Curated objectives for the week — rendered above sessions when present. */
  learningObjectives?: string[];
}

export interface Phase {
  phase: number;
  title: string;
  icon: string;
  accent: string;
  light: string;
  desc: string;
  weeks: Week[];
  /** Curated outcomes for the phase — rendered in TimelinePanel when present. */
  outcomes?: string[];
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

export interface ColorScheme {
  color: string;
  bg: string;
  border: string;
}
