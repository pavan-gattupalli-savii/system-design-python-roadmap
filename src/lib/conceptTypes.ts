// ── Concept types ─────────────────────────────────────────────────────────────
// Shared types for rendering concept pages. Concept *content* lives in the DB
// and is served via /api/concepts — see hooks/useConcepts and api/concepts.
// Diagram components keyed by DiagramKey stay in the frontend bundle because
// they are React SVGs, not data.

export type ConceptCategory =
  | "Networking"
  | "LLD"
  | "Database"
  | "Architecture"
  | "Distributed Systems";

export type DiagramKey =
  | "latency-timeline"
  | "latency-table"
  | "lld-symbols"
  | "cache-hit-miss"
  | "cap-triangle"
  | "lb-flow"
  | "btree-index"
  | "hash-ring"
  | "token-bucket"
  | "queue-flow"
  | "replication-flow"
  | "sharding-flow"
  | "cdn-flow"
  | "dns-resolution"
  | "microservices-flow"
  | "circuit-breaker-flow"
  | "bloom-filter-viz"
  | "observability-pillars"
  | "ws-vs-polling"
  | "event-log-flow"
  | "proxy-flow"
  | "service-mesh-flow"
  | "two-pc-flow"
  | "saga-flow"
  | "inverted-index-viz";

export interface ConceptSection {
  heading: string;
  body?: string;                                        // prose paragraph(s)
  diagram?: DiagramKey;                                 // optional SVG component key
  bullets?: string[];                                   // optional bullet list
  table?: { cols: string[]; rows: string[][] };         // optional data table
  callout?: { kind: "tip" | "note" | "warning"; text: string };
}

export interface Concept {
  slug: string;                                         // URL key e.g. "latency"
  title: string;
  emoji: string;
  category: ConceptCategory;
  tagline: string;                                      // one-line hook shown in sidebar
  sections: ConceptSection[];
  related?: string[];                                   // sibling slugs
  roadmapKeywords?: string[];                           // matched against resource titles for cross-link chip
}
