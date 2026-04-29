// ── ConceptDiagram ────────────────────────────────────────────────────────────
// Dispatches a DiagramKey to the correct SVG component.

import type { DiagramKey } from "../../data/concepts/index";
import { LatencyTimeline } from "./diagrams/LatencyTimeline";
import { LatencyTable }    from "./diagrams/LatencyTable";
import { LLDSymbolGrid }   from "./diagrams/LLDSymbolGrid";

export function ConceptDiagram({ id }: { id: DiagramKey }) {
  switch (id) {
    case "latency-timeline": return <LatencyTimeline />;
    case "latency-table":    return <LatencyTable />;
    case "lld-symbols":      return <LLDSymbolGrid />;
  }
}
