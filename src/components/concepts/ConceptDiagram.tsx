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
  }
}
