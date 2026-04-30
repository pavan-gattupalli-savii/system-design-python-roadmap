// EventLogFlow — append-only event log → projectors → read models

export function EventLogFlow() {
  const W = 700, H = 310;

  const events = [
    { t: "OrderPlaced",       col: "#6366f1" },
    { t: "ItemAdded",         col: "#818cf8" },
    { t: "PaymentCaptured",   col: "#34d399" },
    { t: "OrderShipped",      col: "#fbbf24" },
    { t: "OrderDelivered",    col: "#34d399" },
  ];

  const projectors = [
    { y: 90,  label: "Order Projector",      col: "#6366f1" },
    { y: 170, label: "Analytics Projector",  col: "#fbbf24" },
    { y: 250, label: "Fulfilment Projector", col: "#34d399" },
  ];

  const readModels = [
    { y: 90,  label: "orders_by_user",      desc: "User order history",        col: "#6366f1" },
    { y: 170, label: "revenue_daily",       desc: "Dashboard metrics",         col: "#fbbf24" },
    { y: 250, label: "fulfilment_queue",    desc: "Warehouse picking",         col: "#34d399" },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="el-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
        </defs>

        <text x={350} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Event Sourcing Flow</text>

        {/* EVENT LOG — append-only */}
        <rect x={20} y={35} width={145} height={240} rx={8} fill="#1e293b" stroke="#334155" strokeWidth={1.5} />
        <text x={93} y={54} textAnchor="middle" fontSize={10} fontWeight={800} fill="#94a3b8">EVENT LOG</text>
        <text x={93} y={66} textAnchor="middle" fontSize={8} fill="#475569">append-only</text>
        {events.map((e, i) => (
          <g key={i}>
            <rect x={28} y={76 + i * 40} width={129} height={32} rx={4} fill={e.col + "20"} stroke={e.col + "60"} />
            <text x={93} y={97 + i * 40} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={e.col}>{e.t}</text>
          </g>
        ))}
        {/* Append arrow at bottom */}
        <text x={93} y={284} textAnchor="middle" fontSize={8} fill="#475569">⬇ append new events</text>

        {/* PROJECTORS */}
        {projectors.map((p) => (
          <g key={p.label}>
            {/* Line from log to projector */}
            <line x1={165} y1={155} x2={308} y2={p.y + 20} stroke="#33415560" strokeWidth={1.2} strokeDasharray="4,3" markerEnd="url(#el-arr)" />
            <rect x={310} y={p.y} width={130} height={40} rx={6} fill={p.col + "18"} stroke={p.col} strokeWidth={1.5} />
            <text x={375} y={p.y + 17} textAnchor="middle" fontSize={9} fontWeight={700} fill={p.col}>{p.label}</text>
            <text x={375} y={p.y + 30} textAnchor="middle" fontSize={8} fill="#94a3b8">listens to events</text>
          </g>
        ))}

        {/* READ MODELS */}
        {readModels.map((r) => (
          <g key={r.label}>
            <line x1={440} y1={r.y + 20} x2={543} y2={r.y + 20} stroke="#33415580" strokeWidth={1.2} markerEnd="url(#el-arr)" />
            <rect x={545} y={r.y} width={145} height={40} rx={6} fill={r.col + "10"} stroke={r.col + "80"} strokeWidth={1.5} />
            <text x={618} y={r.y + 16} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={r.col}>{r.label}</text>
            <text x={618} y={r.y + 30} textAnchor="middle" fontSize={7.5} fill="#94a3b8">{r.desc}</text>
          </g>
        ))}

        {/* Column headers */}
        <text x={375} y={36} textAnchor="middle" fontSize={9} fontWeight={700} fill="#64748b">PROJECTORS</text>
        <text x={618} y={36} textAnchor="middle" fontSize={9} fontWeight={700} fill="#64748b">READ MODELS</text>
        <text x={93} y={36} textAnchor="middle" fontSize={9} fontWeight={700} fill="#64748b">EVENT STORE</text>

        {/* Query arrow from read model */}
        <text x={618} y={295} textAnchor="middle" fontSize={8} fill="#475569">← queries come here (CQRS)</text>
      </svg>
    </div>
  );
}
