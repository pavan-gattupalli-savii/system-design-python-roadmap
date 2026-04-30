// TwoPcFlow — coordinator → prepare → participants → commit/abort

export function TwoPcFlow() {
  const W = 700, H = 340;

  const COORD_X = 300, COORD_Y = 60;
  const participants = [
    { x: 60,  y: 200, label: "Node A (DB 1)", col: "#6366f1" },
    { x: 290, y: 200, label: "Node B (DB 2)", col: "#34d399" },
    { x: 520, y: 200, label: "Node C (DB 3)", col: "#fbbf24" },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="tp-blk" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="tp-grn" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#34d399" />
          </marker>
          <marker id="tp-red" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#f87171" />
          </marker>
        </defs>

        <text x={350} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Two-Phase Commit Protocol</text>

        {/* Phase labels */}
        <rect x={10} y={60} width={65} height={72} rx={5} fill="#6366f110" stroke="#6366f140" />
        <text x={43} y={92} textAnchor="middle" fontSize={9} fontWeight={800} fill="#818cf8">Phase 1</text>
        <text x={43} y={105} textAnchor="middle" fontSize={8} fill="#94a3b8">PREPARE</text>
        <text x={43} y={117} textAnchor="middle" fontSize={7} fill="#64748b">(voting)</text>

        <rect x={10} y={155} width={65} height={72} rx={5} fill="#34d39910" stroke="#34d39940" />
        <text x={43} y={187} textAnchor="middle" fontSize={9} fontWeight={800} fill="#34d399">Phase 2</text>
        <text x={43} y={200} textAnchor="middle" fontSize={8} fill="#94a3b8">COMMIT</text>
        <text x={43} y={212} textAnchor="middle" fontSize={7} fill="#64748b">(or abort)</text>

        {/* COORDINATOR */}
        <rect x={COORD_X} y={COORD_Y} width={140} height={50} rx={8} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={2} />
        <text x={COORD_X + 70} y={COORD_Y + 22} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fbbf24">COORDINATOR</text>
        <text x={COORD_X + 70} y={COORD_Y + 38} textAnchor="middle" fontSize={8} fill="#94a3b8">Transaction Manager</text>

        {/* Participants */}
        {participants.map((p) => (
          <g key={p.label}>
            <rect x={p.x} y={p.y} width={140} height={50} rx={8} fill={p.col + "18"} stroke={p.col} strokeWidth={1.5} />
            <text x={p.x + 70} y={p.y + 22} textAnchor="middle" fontSize={9} fontWeight={700} fill={p.col}>{p.label.split(" ")[0]} {p.label.split(" ")[1]}</text>
            <text x={p.x + 70} y={p.y + 36} textAnchor="middle" fontSize={8} fill="#94a3b8">{p.label.split("(")[1]?.replace(")", "")}</text>
          </g>
        ))}

        {/* Phase 1: PREPARE arrows (coord → participants) */}
        {participants.map((p) => (
          <line key={p.label + "-prep"}
            x1={COORD_X + 70} y1={COORD_Y + 50}
            x2={p.x + 70} y2={p.y}
            stroke="#fbbf2460" strokeWidth={1.5} strokeDasharray="none"
            markerEnd="url(#tp-blk)"
          />
        ))}

        {/* PREPARE label on arrows (midpoint between coord and each participant) */}
        {participants.map((p, i) => {
          const mx = (COORD_X + 70 + p.x + 70) / 2;
          const my = (COORD_Y + 50 + p.y) / 2;
          return (
            <text key={i + "-prep-lbl"} x={mx} y={my - 6} textAnchor="middle" fontSize={7.5} fill="#fbbf24" fontWeight={700}>PREPARE</text>
          );
        })}

        {/* Phase 1: YES votes (participants → coord) */}
        {participants.map((p, i) => {
          const offset = (i - 1) * 4; // slight offset for visibility
          return (
            <line key={p.label + "-yes"}
              x1={p.x + 70 + offset} y1={p.y}
              x2={COORD_X + 70 + offset} y2={COORD_Y + 50}
              stroke="#34d39960" strokeWidth={1.2} strokeDasharray="4,3"
              markerEnd="url(#tp-grn)"
            />
          );
        })}

        {/* YES labels */}
        {participants.map((p, i) => {
          const mx = (COORD_X + 70 + p.x + 70) / 2 + 14;
          const my = (COORD_Y + 50 + p.y) / 2 + 12;
          return (
            <text key={i + "-yes-lbl"} x={mx} y={my} textAnchor="middle" fontSize={7.5} fill="#34d399" fontWeight={700}>YES ✓</text>
          );
        })}

        {/* Phase 2: COMMIT arrows */}
        {participants.map((p, i) => (
          <line key={p.label + "-commit"}
            x1={COORD_X + 70} y1={COORD_Y + 50}
            x2={p.x + 70} y2={p.y + 50}
            stroke="#6366f160" strokeWidth={2}
            markerEnd="url(#tp-blk)"
            strokeDasharray="none"
          />
        ))}
        {participants.map((p, i) => {
          const mx = (COORD_X + 70 + p.x + 70) / 2 - 14;
          const my = (COORD_Y + 50 + p.y + 50) / 2 + 14;
          return (
            <text key={i + "-commit-lbl"} x={mx} y={my} textAnchor="middle" fontSize={7.5} fill="#6366f1" fontWeight={700}>COMMIT</text>
          );
        })}

        {/* Bottom notes */}
        <rect x={80} y={290} width={555} height={38} rx={6} fill="#f8717112" stroke="#f8717140" />
        <text x={358} y={308} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">⚠ Blocking Protocol</text>
        <text x={358} y={322} textAnchor="middle" fontSize={8} fill="#94a3b8">If coordinator crashes after PREPARE, participants hold locks indefinitely until coordinator recovers</text>
      </svg>
    </div>
  );
}
