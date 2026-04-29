// ── LLDSymbolGrid ─────────────────────────────────────────────────────────────
// SVG grid showing each UML class-diagram symbol with label + description.
// Drawn with inline SVG so it respects CSS custom properties for dark/light mode.

const SYMBOLS = [
  {
    id: "class",
    name: "Class",
    desc: "Concrete class — the basic building block",
    render: (x: number, y: number) => (
      <g key="class">
        <rect x={x} y={y} width={120} height={70} rx={4}
          fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.5} />
        <line x1={x} y1={y + 22} x2={x + 120} y2={y + 22}
          stroke="var(--text-secondary)" strokeWidth={1.5} />
        <line x1={x} y1={y + 46} x2={x + 120} y2={y + 46}
          stroke="var(--text-secondary)" strokeWidth={1.5} />
        <text x={x + 60} y={y + 15} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text-heading)">ClassName</text>
        <text x={x + 8}  y={y + 35} fontSize={9}  fill="var(--text-secondary)">- field: Type</text>
        <text x={x + 8}  y={y + 60} fontSize={9}  fill="var(--text-secondary)">+ method(): void</text>
      </g>
    ),
  },
  {
    id: "abstract",
    name: "Abstract Class",
    desc: "Cannot be instantiated — name in italics",
    render: (x: number, y: number) => (
      <g key="abstract">
        <rect x={x} y={y} width={120} height={50} rx={4}
          fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="6 3" />
        <line x1={x} y1={y + 22} x2={x + 120} y2={y + 22}
          stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="6 3" />
        <text x={x + 60} y={y + 10} textAnchor="middle" fontSize={8} fill="var(--text-muted)">«abstract»</text>
        <text x={x + 60} y={y + 17} textAnchor="middle" fontSize={11} fontWeight={700} fontStyle="italic" fill="var(--text-heading)">AbstractClass</text>
        <text x={x + 8}  y={y + 38} fontSize={9} fill="var(--text-muted)" fontStyle="italic">+ doWork(): void</text>
      </g>
    ),
  },
  {
    id: "interface",
    name: "Interface",
    desc: "Contract only — no implementation, dashed border",
    render: (x: number, y: number) => (
      <g key="interface">
        <rect x={x} y={y} width={120} height={50} rx={4}
          fill="var(--bg-panel)" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="5 3" />
        <line x1={x} y1={y + 22} x2={x + 120} y2={y + 22}
          stroke="#818cf8" strokeWidth={1} strokeDasharray="5 3" />
        <text x={x + 60} y={y + 10} textAnchor="middle" fontSize={8} fill="#818cf8">«interface»</text>
        <text x={x + 60} y={y + 17} textAnchor="middle" fontSize={11} fontWeight={700} fill="#818cf8">Flyable</text>
        <text x={x + 8}  y={y + 38} fontSize={9} fill="var(--text-muted)">+ fly(): void</text>
      </g>
    ),
  },
  {
    id: "association",
    name: "Association",
    desc: "A knows B — simple navigable reference",
    arrowDesc: "Solid line, open arrow →",
    render: (x: number, y: number) => (
      <g key="association">
        <rect x={x} y={y} width={44} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 22} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Student</text>
        <line x1={x + 44} y1={y + 14} x2={x + 76} y2={y + 14} stroke="var(--text-secondary)" strokeWidth={1.5} />
        {/* open arrowhead */}
        <polyline points={`${x + 68},${y + 9} ${x + 76},${y + 14} ${x + 68},${y + 19}`}
          fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} />
        <rect x={x + 76} y={y} width={44} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 98} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Course</text>
      </g>
    ),
  },
  {
    id: "dependency",
    name: "Dependency",
    desc: "A uses B temporarily (method param, local var)",
    arrowDesc: "Dashed line, open arrow →",
    render: (x: number, y: number) => (
      <g key="dependency">
        <rect x={x} y={y} width={52} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 26} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">OrderSvc</text>
        <line x1={x + 52} y1={y + 14} x2={x + 68} y2={y + 14}
          stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" />
        <polyline points={`${x + 60},${y + 9} ${x + 68},${y + 14} ${x + 60},${y + 19}`}
          fill="none" stroke="var(--text-muted)" strokeWidth={1.5} />
        <rect x={x + 68} y={y} width={52} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 94} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">PaymentDTO</text>
      </g>
    ),
  },
  {
    id: "aggregation",
    name: "Aggregation",
    desc: "A has B — B survives without A (hollow ◇)",
    arrowDesc: "Solid line, hollow diamond at A →",
    render: (x: number, y: number) => (
      <g key="aggregation">
        <rect x={x} y={y} width={36} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 18} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Team</text>
        {/* hollow diamond at left side of "Team" box */}
        <polygon
          points={`${x + 36},${y + 14} ${x + 46},${y + 9} ${x + 56},${y + 14} ${x + 46},${y + 19}`}
          fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.5}
        />
        <line x1={x + 56} y1={y + 14} x2={x + 84} y2={y + 14} stroke="var(--text-secondary)" strokeWidth={1.5} />
        <polyline points={`${x + 76},${y + 9} ${x + 84},${y + 14} ${x + 76},${y + 19}`}
          fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} />
        <rect x={x + 84} y={y} width={36} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 102} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Player</text>
      </g>
    ),
  },
  {
    id: "composition",
    name: "Composition",
    desc: "A owns B — B dies with A (filled ◆)",
    arrowDesc: "Solid line, filled diamond at A →",
    render: (x: number, y: number) => (
      <g key="composition">
        <rect x={x} y={y} width={36} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 18} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">House</text>
        {/* filled diamond */}
        <polygon
          points={`${x + 36},${y + 14} ${x + 46},${y + 9} ${x + 56},${y + 14} ${x + 46},${y + 19}`}
          fill="var(--text-secondary)" stroke="var(--text-secondary)" strokeWidth={1}
        />
        <line x1={x + 56} y1={y + 14} x2={x + 84} y2={y + 14} stroke="var(--text-secondary)" strokeWidth={1.5} />
        <polyline points={`${x + 76},${y + 9} ${x + 84},${y + 14} ${x + 76},${y + 19}`}
          fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} />
        <rect x={x + 84} y={y} width={36} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 102} y={y + 18} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Room</text>
      </g>
    ),
  },
  {
    id: "inheritance",
    name: "Inheritance",
    desc: "A extends B — 'is-a' (hollow triangle ▷)",
    arrowDesc: "Solid line, hollow triangle at parent",
    render: (x: number, y: number) => (
      <g key="inheritance">
        <rect x={x} y={y + 22} width={36} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 18} y={y + 40} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Dog</text>
        <line x1={x + 36} y1={y + 36} x2={x + 76} y2={y + 36} stroke="var(--text-secondary)" strokeWidth={1.5} />
        {/* hollow triangle pointing right */}
        <polygon
          points={`${x + 76},${y + 30} ${x + 88},${y + 36} ${x + 76},${y + 42}`}
          fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.5}
        />
        <rect x={x + 88} y={y + 22} width={42} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 109} y={y + 40} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Animal</text>
      </g>
    ),
  },
  {
    id: "realization",
    name: "Realization",
    desc: "A implements interface B (dashed ▷)",
    arrowDesc: "Dashed line, hollow triangle at interface",
    render: (x: number, y: number) => (
      <g key="realization">
        <rect x={x} y={y + 22} width={36} height={28} rx={3} fill="var(--bg-panel)" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={x + 18} y={y + 40} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-heading)">Duck</text>
        <line x1={x + 36} y1={y + 36} x2={x + 76} y2={y + 36}
          stroke="#818cf8" strokeWidth={1.5} strokeDasharray="5 3" />
        <polygon
          points={`${x + 76},${y + 30} ${x + 88},${y + 36} ${x + 76},${y + 42}`}
          fill="var(--bg-panel)" stroke="#818cf8" strokeWidth={1.5}
        />
        <rect x={x + 88} y={y + 22} width={44} height={28} rx={3}
          fill="var(--bg-panel)" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="5 3" />
        <text x={x + 88 + 22} y={y + 34} textAnchor="middle" fontSize={7} fill="#818cf8">«interface»</text>
        <text x={x + 88 + 22} y={y + 44} textAnchor="middle" fontSize={9} fontWeight={700} fill="#818cf8">Flyable</text>
      </g>
    ),
  },
];

const COLS = 3;
const CARD_W = 260;
const CARD_H = 110;
const GAP_X  = 16;
const GAP_Y  = 16;
const PAD    = 16;

export function LLDSymbolGrid() {
  const rows = Math.ceil(SYMBOLS.length / COLS);
  const svgW = COLS * CARD_W + (COLS - 1) * GAP_X + PAD * 2;
  const svgH = rows * CARD_H + (rows - 1) * GAP_Y + PAD * 2;

  return (
    <div style={{ overflowX: "auto", marginTop: 20 }}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        style={{ maxWidth: svgW, display: "block", fontFamily: "inherit" }}
        aria-label="UML class diagram symbols reference"
      >
        {SYMBOLS.map((sym, idx) => {
          const col = idx % COLS;
          const row = Math.floor(idx / COLS);
          const cardX = PAD + col * (CARD_W + GAP_X);
          const cardY = PAD + row * (CARD_H + GAP_Y);
          const drawX = cardX + 10;
          const drawY = cardY + 30;

          return (
            <g key={sym.id}>
              {/* Card background */}
              <rect x={cardX} y={cardY} width={CARD_W} height={CARD_H} rx={8}
                fill="var(--bg-panel)" stroke="var(--border-subtle)" strokeWidth={1} />

              {/* Name + description at top */}
              <text x={cardX + 10} y={cardY + 14} fontSize={11} fontWeight={700} fill="var(--text-heading)">
                {sym.name}
              </text>
              <text x={cardX + 10} y={cardY + 25} fontSize={9} fill="var(--text-muted)">
                {sym.desc.length > 36 ? sym.desc.slice(0, 36) + "…" : sym.desc}
              </text>

              {/* Diagram render */}
              {sym.render(drawX, drawY)}
            </g>
          );
        })}
      </svg>

      {/* Below grid: full descriptions as cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 20 }}>
        {SYMBOLS.map((s) => (
          <div key={s.id} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, padding: "10px 14px", fontSize: 12,
          }}>
            <div style={{
              minWidth: 130, fontWeight: 700, color: "var(--text-heading)", flexShrink: 0,
            }}>
              {s.name}
            </div>
            <div style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {s.desc}
              {s.arrowDesc && (
                <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-muted)",
                  background: "var(--bg-secondary)", borderRadius: 4, padding: "1px 6px" }}>
                  {s.arrowDesc}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
