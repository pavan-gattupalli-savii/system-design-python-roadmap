// ── ConceptDiagram ────────────────────────────────────────────────────────────
// Dispatches a DiagramKey to the correct SVG component. Each diagram is a
// React.lazy() import so the ConceptsPage chunk only ships the diagrams the
// user actually navigates to. The Suspense fallback is a sized placeholder
// to keep layout stable while a diagram chunk loads.

import { lazy, Suspense } from "react";
import type { ComponentType } from "react";
import type { DiagramKey } from "../../lib/conceptTypes";

const DIAGRAMS: Record<DiagramKey, () => Promise<{ default: ComponentType }>> = {
  "latency-timeline":     () => import("./diagrams/LatencyTimeline").then((m) => ({ default: m.LatencyTimeline })),
  "latency-table":        () => import("./diagrams/LatencyTable").then((m) => ({ default: m.LatencyTable })),
  "lld-symbols":          () => import("./diagrams/LLDSymbolGrid").then((m) => ({ default: m.LLDSymbolGrid })),
  "cache-hit-miss":       () => import("./diagrams/CacheHitMiss").then((m) => ({ default: m.CacheHitMiss })),
  "cap-triangle":         () => import("./diagrams/CapTriangle").then((m) => ({ default: m.CapTriangle })),
  "lb-flow":              () => import("./diagrams/LBFlow").then((m) => ({ default: m.LBFlow })),
  "btree-index":          () => import("./diagrams/BTreeIndex").then((m) => ({ default: m.BTreeIndex })),
  "hash-ring":            () => import("./diagrams/HashRing").then((m) => ({ default: m.HashRing })),
  "token-bucket":         () => import("./diagrams/TokenBucket").then((m) => ({ default: m.TokenBucket })),
  "queue-flow":           () => import("./diagrams/QueueFlow").then((m) => ({ default: m.QueueFlow })),
  "replication-flow":     () => import("./diagrams/ReplicationFlow").then((m) => ({ default: m.ReplicationFlow })),
  "sharding-flow":        () => import("./diagrams/ShardingFlow").then((m) => ({ default: m.ShardingFlow })),
  "cdn-flow":             () => import("./diagrams/CdnFlow").then((m) => ({ default: m.CdnFlow })),
  "dns-resolution":       () => import("./diagrams/DnsResolution").then((m) => ({ default: m.DnsResolution })),
  "microservices-flow":   () => import("./diagrams/MicroservicesFlow").then((m) => ({ default: m.MicroservicesFlow })),
  "circuit-breaker-flow": () => import("./diagrams/CircuitBreaker").then((m) => ({ default: m.CircuitBreaker })),
  "bloom-filter-viz":     () => import("./diagrams/BloomFilter").then((m) => ({ default: m.BloomFilter })),
  "observability-pillars": () => import("./diagrams/ObservabilityPillars").then((m) => ({ default: m.ObservabilityPillars })),
  "ws-vs-polling":        () => import("./diagrams/WsVsPolling").then((m) => ({ default: m.WsVsPolling })),
  "event-log-flow":       () => import("./diagrams/EventLogFlow").then((m) => ({ default: m.EventLogFlow })),
  "proxy-flow":           () => import("./diagrams/ProxyFlow").then((m) => ({ default: m.ProxyFlow })),
  "service-mesh-flow":    () => import("./diagrams/ServiceMeshFlow").then((m) => ({ default: m.ServiceMeshFlow })),
  "two-pc-flow":          () => import("./diagrams/TwoPcFlow").then((m) => ({ default: m.TwoPcFlow })),
  "saga-flow":            () => import("./diagrams/SagaFlow").then((m) => ({ default: m.SagaFlow })),
  "inverted-index-viz":   () => import("./diagrams/InvertedIndex").then((m) => ({ default: m.InvertedIndex })),
};

const lazyCache = new Map<DiagramKey, ComponentType>();

function getDiagram(id: DiagramKey): ComponentType {
  let cmp = lazyCache.get(id);
  if (!cmp) {
    cmp = lazy(DIAGRAMS[id]);
    lazyCache.set(id, cmp);
  }
  return cmp;
}

function Placeholder() {
  return (
    <div style={{
      width: "100%", minHeight: 200, display: "grid", placeItems: "center",
      color: "var(--text-muted)", fontSize: 12, fontStyle: "italic",
    }}>
      Loading diagram…
    </div>
  );
}

export function ConceptDiagram({ id }: { id: DiagramKey }) {
  const Diagram = getDiagram(id);
  return (
    <Suspense fallback={<Placeholder />}>
      <Diagram />
    </Suspense>
  );
}
