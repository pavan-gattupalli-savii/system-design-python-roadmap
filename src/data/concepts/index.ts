// ── Concepts registry ─────────────────────────────────────────────────────────
// All content is bundled at build time — zero API calls.
// Add a new concept by: creating a .ts file, exporting a Concept object, and
// appending it to the CONCEPTS array below.

import { latency }           from "./latency";
import { lldSymbols }        from "./lld-symbols";
import { caching }           from "./caching";
import { capTheorem }        from "./cap-theorem";
import { loadBalancing }     from "./load-balancing";
import { databaseIndexes }   from "./database-indexes";
import { consistentHashing } from "./consistent-hashing";
import { sqlVsNosql }        from "./sql-vs-nosql";
import { rateLimiting }      from "./rate-limiting";
import { messageQueues }     from "./message-queues";
import { apiDesign }         from "./api-design";
import { replication }       from "./replication";
import { sharding }          from "./sharding";
import { cdn }               from "./cdn";
import { dns }               from "./dns";
import { acidTransactions }  from "./acid-transactions";
import { microservices }     from "./microservices";
import { circuitBreaker }    from "./circuit-breaker";
import { bloomFilter }       from "./bloom-filter";
import { observability }     from "./observability";
import { websockets }        from "./websockets";
import { eventSourcing }     from "./event-sourcing";
import { proxies }           from "./proxies";
import { serviceMesh }       from "./service-mesh";
import { twoPc }             from "./two-phase-commit";
import { sagaPattern }       from "./saga-pattern";
import { fullTextSearch }    from "./full-text-search";

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
  caching,
  capTheorem,
  loadBalancing,
  databaseIndexes,
  consistentHashing,
  sqlVsNosql,
  rateLimiting,
  messageQueues,
  apiDesign,
  replication,
  sharding,
  cdn,
  dns,
  acidTransactions,
  microservices,
  circuitBreaker,
  bloomFilter,
  observability,
  websockets,
  eventSourcing,
  proxies,
  serviceMesh,
  twoPc,
  sagaPattern,
  fullTextSearch,
];

export const CONCEPTS_BY_SLUG = new Map(CONCEPTS.map((c) => [c.slug, c]));

export const CONCEPT_CATEGORIES = Array.from(
  new Set(CONCEPTS.map((c) => c.category)),
) as ConceptCategory[];
