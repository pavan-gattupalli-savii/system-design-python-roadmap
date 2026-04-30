// ── ConceptDiagram ────────────────────────────────────────────────────────────
// Dispatches a DiagramKey to the correct SVG component.

import type { DiagramKey } from "../../data/concepts/index";
import { LatencyTimeline }    from "./diagrams/LatencyTimeline";
import { LatencyTable }       from "./diagrams/LatencyTable";
import { LLDSymbolGrid }      from "./diagrams/LLDSymbolGrid";
import { CacheHitMiss }       from "./diagrams/CacheHitMiss";
import { CapTriangle }        from "./diagrams/CapTriangle";
import { LBFlow }             from "./diagrams/LBFlow";
import { BTreeIndex }         from "./diagrams/BTreeIndex";
import { HashRing }           from "./diagrams/HashRing";
import { TokenBucket }        from "./diagrams/TokenBucket";
import { QueueFlow }          from "./diagrams/QueueFlow";
import { ReplicationFlow }    from "./diagrams/ReplicationFlow";
import { ShardingFlow }       from "./diagrams/ShardingFlow";
import { CdnFlow }            from "./diagrams/CdnFlow";
import { DnsResolution }      from "./diagrams/DnsResolution";
import { MicroservicesFlow }  from "./diagrams/MicroservicesFlow";
import { CircuitBreaker }     from "./diagrams/CircuitBreaker";
import { BloomFilter }        from "./diagrams/BloomFilter";
import { ObservabilityPillars } from "./diagrams/ObservabilityPillars";
import { WsVsPolling }        from "./diagrams/WsVsPolling";
import { EventLogFlow }       from "./diagrams/EventLogFlow";
import { ProxyFlow }          from "./diagrams/ProxyFlow";
import { ServiceMeshFlow }    from "./diagrams/ServiceMeshFlow";
import { TwoPcFlow }          from "./diagrams/TwoPcFlow";
import { SagaFlow }           from "./diagrams/SagaFlow";
import { InvertedIndex }      from "./diagrams/InvertedIndex";

export function ConceptDiagram({ id }: { id: DiagramKey }) {
  switch (id) {
    case "latency-timeline":  return <LatencyTimeline />;
    case "latency-table":     return <LatencyTable />;
    case "lld-symbols":       return <LLDSymbolGrid />;
    case "cache-hit-miss":    return <CacheHitMiss />;
    case "cap-triangle":      return <CapTriangle />;
    case "lb-flow":           return <LBFlow />;
    case "btree-index":       return <BTreeIndex />;
    case "hash-ring":         return <HashRing />;
    case "token-bucket":      return <TokenBucket />;
    case "queue-flow":        return <QueueFlow />;
    case "replication-flow":  return <ReplicationFlow />;
    case "sharding-flow":     return <ShardingFlow />;
    case "cdn-flow":          return <CdnFlow />;
    case "dns-resolution":    return <DnsResolution />;
    case "microservices-flow": return <MicroservicesFlow />;
    case "circuit-breaker-flow":   return <CircuitBreaker />;
    case "bloom-filter-viz":       return <BloomFilter />;
    case "observability-pillars":  return <ObservabilityPillars />;
    case "ws-vs-polling":          return <WsVsPolling />;
    case "event-log-flow":         return <EventLogFlow />;
    case "proxy-flow":             return <ProxyFlow />;
    case "service-mesh-flow":      return <ServiceMeshFlow />;
    case "two-pc-flow":            return <TwoPcFlow />;
    case "saga-flow":              return <SagaFlow />;
    case "inverted-index-viz":     return <InvertedIndex />;
  }
}
