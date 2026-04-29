// ── Concepts registry ─────────────────────────────────────────────────────────
// All content is bundled at build time — zero API calls.
// Add a new concept by: creating a .ts file, exporting a Concept object, and
// appending it to the CONCEPTS array below.

import { latency }    from "./latency";
import { lldSymbols } from "./lld-symbols";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ConceptCategory =
  | "Networking"
  | "LLD"
  | "Database"
  | "Architecture"
  | "Distributed Systems";

export type DiagramKey =
  | "latency-timeline"
  | "latency-table"
  | "lld-symbols";

export interface ConceptSection {
  heading: string;
  body?: string;                         // prose paragraph(s)
  diagram?: DiagramKey;                  // optional SVG component key
  bullets?: string[];                    // optional bullet list
  table?: { cols: string[]; rows: string[][] }; // optional data table
  callout?: { kind: "tip" | "note" | "warning"; text: string };
}

export interface Concept {
  slug: string;                          // URL key e.g. "latency"
  title: string;
  emoji: string;
  category: ConceptCategory;
  tagline: string;                       // one-line hook shown in sidebar
  sections: ConceptSection[];
  related?: string[];                    // sibling slugs
  roadmapKeywords?: string[];            // matched against resource/week titles for cross-link chip
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const CONCEPTS: Concept[] = [
  latency,
  lldSymbols,
];

export const CONCEPTS_BY_SLUG = new Map(CONCEPTS.map((c) => [c.slug, c]));

export const CONCEPT_CATEGORIES = Array.from(
  new Set(CONCEPTS.map((c) => c.category)),
) as ConceptCategory[];
