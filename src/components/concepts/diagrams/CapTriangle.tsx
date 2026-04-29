// CapTriangle — CAP theorem triangle with CP/AP/CA zones and example systems

export function CapTriangle() {
  const W = 640, H = 400;
  // Triangle vertices
  const TOP   = { x: 320, y: 30  };  // Consistency
  const LEFT  = { x: 60,  y: 340 };  // Availability
  const RIGHT = { x: 580, y: 340 };  // Partition Tolerance

  const midCP = { x: (TOP.x + RIGHT.x) / 2, y: (TOP.y + RIGHT.y) / 2 };
  const midAP = { x: (LEFT.x + RIGHT.x) / 2, y: (LEFT.y + RIGHT.y) / 2 };
  const midCA = { x: (TOP.x + LEFT.x) / 2, y: (TOP.y + LEFT.y) / 2 };

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        {/* Triangle fill zones */}
        {/* CP zone (top-right) */}
        <polygon
          points={`${TOP.x},${TOP.y} ${RIGHT.x},${RIGHT.y} ${(TOP.x+RIGHT.x)/2+20},${(TOP.y+RIGHT.y)/2}`}
          fill="#38bdf810" stroke="none"
        />
        {/* AP zone (bottom) */}
        <polygon
          points={`${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y} ${(LEFT.x+RIGHT.x)/2},${(LEFT.y+RIGHT.y)/2-20}`}
          fill="#f472b610" stroke="none"
        />
        {/* CA zone (top-left) */}
        <polygon
          points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${(TOP.x+LEFT.x)/2-20},${(TOP.y+LEFT.y)/2}`}
          fill="#4ade8010" stroke="none"
        />

        {/* Main triangle */}
        <polygon
          points={`${TOP.x},${TOP.y} ${LEFT.x},${LEFT.y} ${RIGHT.x},${RIGHT.y}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth={2}
        />

        {/* Corner labels */}
        <text x={TOP.x} y={TOP.y - 14} textAnchor="middle" fontSize={14} fontWeight={800} fill="#38bdf8">C</text>
        <text x={TOP.x} y={TOP.y - 2} textAnchor="middle" fontSize={9} fill="#94a3b8">Consistency</text>

        <text x={LEFT.x - 8} y={LEFT.y + 6} textAnchor="end" fontSize={14} fontWeight={800} fill="#4ade80">A</text>
        <text x={LEFT.x - 8} y={LEFT.y + 18} textAnchor="end" fontSize={9} fill="#94a3b8">Availability</text>

        <text x={RIGHT.x + 8} y={RIGHT.y + 6} textAnchor="start" fontSize={14} fontWeight={800} fill="#f472b6">P</text>
        <text x={RIGHT.x + 8} y={RIGHT.y + 18} textAnchor="start" fontSize={9} fill="#94a3b8">Partition Tolerance</text>

        {/* Zone labels */}
        <text x={midCP.x + 50} y={midCP.y - 20} textAnchor="middle" fontSize={13} fontWeight={800} fill="#38bdf8">CP</text>
        <text x={midCP.x + 50} y={midCP.y - 6} textAnchor="middle" fontSize={8} fill="#94a3b8">ZooKeeper, HBase</text>
        <text x={midCP.x + 50} y={midCP.y + 6} textAnchor="middle" fontSize={8} fill="#94a3b8">MongoDB(majority), etcd</text>

        <text x={midAP.x} y={midAP.y + 38} textAnchor="middle" fontSize={13} fontWeight={800} fill="#f472b6">AP</text>
        <text x={midAP.x} y={midAP.y + 52} textAnchor="middle" fontSize={8} fill="#94a3b8">Cassandra, DynamoDB</text>
        <text x={midAP.x} y={midAP.y + 64} textAnchor="middle" fontSize={8} fill="#94a3b8">CouchDB, Riak</text>

        <text x={midCA.x - 50} y={midCA.y - 10} textAnchor="middle" fontSize={13} fontWeight={800} fill="#4ade80">CA</text>
        <text x={midCA.x - 50} y={midCA.y + 4} textAnchor="middle" fontSize={8} fill="#94a3b8">Single-node RDBMS</text>
        <text x={midCA.x - 50} y={midCA.y + 16} textAnchor="middle" fontSize={8} fill="#64748b">(no real partition)</text>

        {/* "YOU ARE HERE" partition note */}
        <line x1={RIGHT.x - 20} y1={240} x2={RIGHT.x - 60} y2={200} stroke="#f87171" strokeWidth={1} strokeDasharray="3,2" />
        <text x={RIGHT.x - 62} y={196} textAnchor="end" fontSize={9} fill="#f87171" fontWeight={700}>Network partitions</text>
        <text x={RIGHT.x - 62} y={207} textAnchor="end" fontSize={9} fill="#f87171">ALWAYS happen.</text>
        <text x={RIGHT.x - 62} y={218} textAnchor="end" fontSize={9} fill="#f87171">Choose CP or AP.</text>

        {/* Divider line CP vs AP */}
        <line x1={TOP.x} y1={TOP.y + 10} x2={RIGHT.x} y2={RIGHT.y - 10}
          stroke="#38bdf844" strokeWidth={1} strokeDasharray="4,4" />
        <line x1={LEFT.x + 10} y1={LEFT.y} x2={RIGHT.x - 10} y2={RIGHT.y}
          stroke="#f472b644" strokeWidth={1} strokeDasharray="4,4" />
      </svg>
    </div>
  );
}
