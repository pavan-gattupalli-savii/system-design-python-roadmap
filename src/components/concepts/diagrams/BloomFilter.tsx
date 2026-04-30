// BloomFilter — bit array, hash functions, insert + query demonstration

export function BloomFilter() {
  const W = 700, H = 330;

  // Bit array: 16 positions, indices 0..15
  const bits = [0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1]; // positions set by prior inserts
  // "apple"  → hashes → positions 2, 7, 12
  // "banana" → hashes → positions 4, 9, 15

  const CELL_W = 36, CELL_H = 36;
  const ARRAY_X = 50, ARRAY_Y = 160;
  const N = 16;

  // query "cherry" → hashes → positions 4, 9, 12 — all set → false positive!
  const queryHits = [4, 9, 12];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="bf-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="bf-grn" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#34d399" />
          </marker>
          <marker id="bf-yel" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
          </marker>
        </defs>

        <text x={350} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Bloom Filter — Bit Array Visualization</text>

        {/* Bit array */}
        {bits.map((b, i) => {
          const cx = ARRAY_X + i * CELL_W;
          const isQuery = queryHits.includes(i);
          const fill = b === 1 ? (isQuery ? "#fbbf2430" : "#6366f130") : "#1e293b";
          const stroke = b === 1 ? (isQuery ? "#fbbf24" : "#6366f1") : "#334155";
          return (
            <g key={i}>
              <rect x={cx} y={ARRAY_Y} width={CELL_W - 2} height={CELL_H} rx={3} fill={fill} stroke={stroke} strokeWidth={1.5} />
              <text x={cx + (CELL_W - 2) / 2} y={ARRAY_Y + 22} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={b === 1 ? (isQuery ? "#fbbf24" : "#818cf8") : "#475569"}>{b}</text>
              <text x={cx + (CELL_W - 2) / 2} y={ARRAY_Y + 48} textAnchor="middle" fontSize={8} fill="#475569">{i}</text>
        </g>
          );
        })}

        {/* "apple" insert — positions 2, 7, 12 */}
        <text x={50} y={90} fontSize={10} fontWeight={700} fill="#34d399">Insert "apple" → h1=2, h2=7, h3=12</text>
        <line x1={130} y1={96} x2={ARRAY_X + 2*CELL_W+15} y2={ARRAY_Y} stroke="#34d39980" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-grn)" />
        <line x1={180} y1={96} x2={ARRAY_X + 7*CELL_W+15} y2={ARRAY_Y} stroke="#34d39980" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-grn)" />
        <line x1={230} y1={96} x2={ARRAY_X + 12*CELL_W+15} y2={ARRAY_Y} stroke="#34d39980" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-grn)" />

        {/* "banana" insert — positions 4, 9, 15 */}
        <text x={50} y={112} fontSize={10} fontWeight={700} fill="#6366f1">Insert "banana" → h1=4, h2=9, h3=15</text>
        <line x1={135} y1={118} x2={ARRAY_X + 4*CELL_W+15} y2={ARRAY_Y} stroke="#6366f180" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-arr)" />
        <line x1={192} y1={118} x2={ARRAY_X + 9*CELL_W+15} y2={ARRAY_Y} stroke="#6366f180" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-arr)" />
        <line x1={252} y1={118} x2={ARRAY_X + 15*CELL_W+15} y2={ARRAY_Y} stroke="#6366f180" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-arr)" />

        {/* Query "cherry" — positions 4, 9, 12 — FALSE POSITIVE */}
        <text x={400} y={90} fontSize={10} fontWeight={700} fill="#fbbf24">Query "cherry" → h1=4, h2=9, h3=12</text>
        <line x1={450} y1={96} x2={ARRAY_X + 4*CELL_W+15} y2={ARRAY_Y} stroke="#fbbf2480" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-yel)" />
        <line x1={508} y1={96} x2={ARRAY_X + 9*CELL_W+15} y2={ARRAY_Y} stroke="#fbbf2480" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-yel)" />
        <line x1={565} y1={96} x2={ARRAY_X + 12*CELL_W+15} y2={ARRAY_Y} stroke="#fbbf2480" strokeWidth={1.2} strokeDasharray="3,2" markerEnd="url(#bf-yel)" />

        {/* Labels below array */}
        <rect x={140} y={220} width={180} height={26} rx={4} fill="#34d39912" stroke="#34d39940" />
        <text x={230} y={237} textAnchor="middle" fontSize={9} fill="#34d399" fontWeight={600}>Positions 2,7,12 set by "apple"</text>

        <rect x={ARRAY_X + 4*CELL_W - 4} y={220} width={52} height={26} rx={4} fill="#6366f112" stroke="#6366f140" />
        <text x={ARRAY_X + 4*CELL_W + 22} y={237} textAnchor="middle" fontSize={9} fill="#818cf8">+banana</text>

        {/* False positive result box */}
        <rect x={395} y={215} width={290} height={52} rx={6} fill="#fbbf2415" stroke="#fbbf24" strokeWidth={1.5} />
        <text x={540} y={234} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fbbf24">⚠ FALSE POSITIVE</text>
        <text x={540} y={250} textAnchor="middle" fontSize={9} fill="#94a3b8">All 3 bits are 1 → "Probably in set"</text>
        <text x={540} y={263} textAnchor="middle" fontSize={9} fill="#94a3b8">"cherry" was never inserted — collision!</text>

        {/* Guarantee note */}
        <rect x={50} y={285} width={600} height={30} rx={5} fill="#1e293b" stroke="#334155" />
        <text x={350} y={300} textAnchor="middle" fontSize={9} fill="#94a3b8">
          <tspan fontWeight={700} fill="#f8fafc">Guarantee: </tspan>
          A "NO" answer is always correct. A "YES" answer means "probably yes" (false positive rate is tunable).
        </text>
      </svg>
    </div>
  );
}
