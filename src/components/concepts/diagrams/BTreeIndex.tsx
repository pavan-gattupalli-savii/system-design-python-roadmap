// BTreeIndex — 3-level B-tree with search path highlighted for key lookup

export function BTreeIndex() {
  const W = 700, H = 360;

  // Node layout [level][index] → center x
  const root      = { x: 350, y: 50, keys: ["42", "89"] };
  const internal  = [
    { x: 175, y: 160, keys: ["18", "31"] },
    { x: 525, y: 160, keys: ["56", "73"] },
  ];
  const leaves = [
    { x: 70,  y: 270, keys: ["5", "12", "18"] },
    { x: 220, y: 270, keys: ["20", "24", "31"] },
    { x: 370, y: 270, keys: ["42", "48", "56"] },
    { x: 520, y: 270, keys: ["60", "67", "73"] },
    { x: 640, y: 270, keys: ["81", "89", "95"] },
  ];

  const NWIDTH = 110, NHEIGHT = 38;
  const highlight = "#fbbf24"; // searching for 60
  const normal = "#64748b";

  function Node({ x, y, keys, isHighlight = false }: {x:number,y:number,keys:string[],isHighlight?:boolean}) {
    const stroke = isHighlight ? highlight : normal;
    const fill   = isHighlight ? "#fbbf2415" : "var(--bg-panel, #1e293b)";
    return (
      <g>
        <rect x={x - NWIDTH/2} y={y} width={NWIDTH} height={NHEIGHT} rx={6}
          fill={fill} stroke={stroke} strokeWidth={isHighlight ? 2 : 1.5} />
        {keys.map((k, i) => {
          const kx = x - NWIDTH/2 + 14 + i * (NWIDTH - 14) / keys.length;
          const kHighlight = k === "60" || (isHighlight && true);
          return (
            <text key={k} x={kx + 8} y={y + 24} textAnchor="middle"
              fontSize={11} fontWeight={kHighlight && k === "60" ? 800 : 600}
              fill={k === "60" ? highlight : isHighlight ? "#e2e8f0" : "#94a3b8"}>
              {k}
            </text>
          );
        })}
      </g>
    );
  }

  function Edge({ x1, y1, x2, y2, highlight: hl }: {x1:number,y1:number,x2:number,y2:number,highlight?:boolean}) {
    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={hl ? "#fbbf24" : "#334155"} strokeWidth={hl ? 2 : 1.5}
        strokeDasharray={hl ? undefined : undefined} />
    );
  }

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="bt-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Level labels */}
        <text x={14} y={73} fontSize={9} fill="#475569" textAnchor="middle" transform="rotate(-90 14 73)">Root</text>
        <text x={14} y={183} fontSize={9} fill="#475569" textAnchor="middle" transform="rotate(-90 14 183)">Internal</text>
        <text x={14} y={293} fontSize={9} fill="#475569" textAnchor="middle" transform="rotate(-90 14 293)">Leaf</text>

        {/* Root → internal edges */}
        <Edge x1={root.x - 20} y1={root.y + NHEIGHT} x2={internal[0].x + 20} y2={internal[0].y} />
        <Edge x1={root.x + 20} y1={root.y + NHEIGHT} x2={internal[1].x - 20} y2={internal[1].y} highlight={true} />

        {/* Internal[0] → leaves 0,1 */}
        <Edge x1={internal[0].x - 20} y1={internal[0].y + NHEIGHT} x2={leaves[0].x + 20} y2={leaves[0].y} />
        <Edge x1={internal[0].x + 20} y1={internal[0].y + NHEIGHT} x2={leaves[1].x - 10} y2={leaves[1].y} />
        {/* Internal[1] → leaves 2,3,4 */}
        <Edge x1={internal[1].x - 30} y1={internal[1].y + NHEIGHT} x2={leaves[2].x + 20} y2={leaves[2].y} />
        <Edge x1={internal[1].x} y1={internal[1].y + NHEIGHT} x2={leaves[3].x} y2={leaves[3].y} highlight={true} />
        <Edge x1={internal[1].x + 30} y1={internal[1].y + NHEIGHT} x2={leaves[4].x - 20} y2={leaves[4].y} />

        {/* Leaf next-pointers */}
        {leaves.slice(0,-1).map((l,i) => (
          <line key={i} x1={l.x + NWIDTH/2} y1={l.y + NHEIGHT/2}
            x2={leaves[i+1].x - NWIDTH/2} y2={leaves[i+1].y + NHEIGHT/2}
            stroke="#334155" strokeWidth={1} strokeDasharray="3,3" />
        ))}

        {/* Nodes */}
        <Node x={root.x} y={root.y} keys={root.keys} isHighlight />
        <Node x={internal[0].x} y={internal[0].y} keys={internal[0].keys} />
        <Node x={internal[1].x} y={internal[1].y} keys={internal[1].keys} isHighlight />
        {leaves.map((l, i) => (
          <Node key={i} x={l.x} y={l.y} keys={l.keys} isHighlight={i === 3} />
        ))}

        {/* Search annotation */}
        <text x={W - 10} y={16} textAnchor="end" fontSize={10} fill="#fbbf24" fontWeight={700}>
          Searching for key 60 →
        </text>
        <text x={W - 10} y={30} textAnchor="end" fontSize={9} fill="#94a3b8">
          60 &gt; 42, 60 &lt; 89 → right subtree
        </text>

        {/* Leaf linked-list label */}
        <text x={350} y={330} textAnchor="middle" fontSize={9} fill="#475569">
          ← leaf nodes are doubly-linked for range scans →
        </text>

        {/* Found marker */}
        <circle cx={leaves[3].x + 22} cy={leaves[3].y + 19} r={8} fill="none" stroke="#fbbf24" strokeWidth={2} />
        <text x={leaves[3].x + 52} y={leaves[3].y + 53} fontSize={9} fill="#fbbf24">Found!</text>
      </svg>
    </div>
  );
}
