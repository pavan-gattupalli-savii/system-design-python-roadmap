// SagaFlow — choreography (top) vs orchestration (bottom)

export function SagaFlow() {
  const W = 700, H = 340;

  const choreoServices = [
    { x: 30,  label: "Order\nService",     col: "#6366f1", event: "OrderPlaced" },
    { x: 190, label: "Inventory\nService", col: "#34d399", event: "StockReserved" },
    { x: 350, label: "Payment\nService",   col: "#fbbf24", event: "PaymentCaptured" },
    { x: 510, label: "Notif.\nService",    col: "#f87171", event: "" },
  ];

  const orchServices = [
    { x: 30,  label: "Order\nService",     col: "#6366f1" },
    { x: 190, label: "Inventory\nService", col: "#34d399" },
    { x: 350, label: "Payment\nService",   col: "#fbbf24" },
    { x: 510, label: "Notif.\nService",    col: "#f87171" },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="sf-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="sf-red" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#f87171" />
          </marker>
        </defs>

        <text x={350} y={18} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Saga Pattern</text>

        {/* ── CHOREOGRAPHY ── */}
        <text x={10} y={38} fontSize={11} fontWeight={800} fill="#818cf8">Choreography — event-driven, no coordinator</text>

        {/* Service boxes top row */}
        {choreoServices.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={48} width={130} height={52} rx={6} fill={s.col + "18"} stroke={s.col} strokeWidth={1.5} />
            <text x={s.x + 65} y={70} textAnchor="middle" fontSize={9} fontWeight={700} fill={s.col}>{s.name.split("\n")[0]}</text>
            <text x={s.x + 65} y={83} textAnchor="middle" fontSize={9} fontWeight={700} fill={s.col}>{s.name.split("\n")[1]}</text>

            {/* Event bus arrow between services */}
            {i < choreoServices.length - 1 && (
              <>
                <line x1={s.x + 130} y1={74} x2={choreoServices[i + 1].x} y2={74}
                  stroke="#64748b80" strokeWidth={1.5} markerEnd="url(#sf-arr)" />
                <text x={s.x + 130 + (choreoServices[i + 1].x - s.x - 130) / 2} y={70}
                  textAnchor="middle" fontSize={7.5} fill="#94a3b8">{s.event}</text>
              </>
            )}
          </g>
        ))}

        {/* Compensation arrows (reverse) — payment fail example */}
        <line x1={350} y1={100} x2={320} y2={100} stroke="#f8717180" strokeWidth={1.2} strokeDasharray="4,3" markerEnd="url(#sf-red)" />
        <text x={335} y={114} textAnchor="middle" fontSize={7} fill="#f87171">PaymentFailed</text>
        <line x1={320} y1={100} x2={190} y2={100} stroke="#f8717180" strokeWidth={1.2} strokeDasharray="4,3" markerEnd="url(#sf-red)" />
        <text x={255} y={114} textAnchor="middle" fontSize={7} fill="#f87171">StockReleased</text>

        {/* Separator */}
        <line x1={10} y1={130} x2={690} y2={130} stroke="#334155" strokeWidth={1} strokeDasharray="6,4" />

        {/* ── ORCHESTRATION ── */}
        <text x={10} y={152} fontSize={11} fontWeight={800} fill="#fbbf24">Orchestration — central saga orchestrator</text>

        {/* Orchestrator */}
        <rect x={280} y={162} width={140} height={46} rx={8} fill="#fbbf2425" stroke="#fbbf24" strokeWidth={2} />
        <text x={350} y={183} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fbbf24">SAGA</text>
        <text x={350} y={197} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fbbf24">ORCHESTRATOR</text>

        {/* Orchestrator → Services (commands) */}
        {orchServices.map((s, i) => (
          <g key={i}>
            <rect x={s.x} y={242} width={130} height={52} rx={6} fill={s.col + "18"} stroke={s.col} strokeWidth={1.5} />
            <text x={s.x + 65} y={263} textAnchor="middle" fontSize={9} fontWeight={700} fill={s.col}>{s.label.split("\n")[0]}</text>
            <text x={s.x + 65} y={276} textAnchor="middle" fontSize={9} fontWeight={700} fill={s.col}>{s.label.split("\n")[1]}</text>

            {/* Command arrow down */}
            <line x1={350} y1={208} x2={s.x + 65} y2={242}
              stroke={s.col + "80"} strokeWidth={1.5} markerEnd="url(#sf-arr)" />
            {/* Reply arrow up */}
            <line x1={s.x + 72} y1={242} x2={358} y2={208}
              stroke="#64748b60" strokeWidth={1} strokeDasharray="3,2" markerEnd="url(#sf-arr)" />
          </g>
        ))}

        {/* Command labels */}
        <text x={95} y={238} textAnchor="middle" fontSize={7} fill="#6366f1">PlaceOrder ↓ / OK ↑</text>
        <text x={255} y={224} textAnchor="middle" fontSize={7} fill="#34d399">ReserveStock ↓</text>
        <text x={445} y={224} textAnchor="middle" fontSize={7} fill="#fbbf24">ChargePayment ↓</text>
        <text x={608} y={238} textAnchor="middle" fontSize={7} fill="#f87171">SendEmail ↓</text>

        {/* Bottom note */}
        <rect x={10} y={308} width={680} height={24} rx={5} fill="#1e293b" stroke="#334155" />
        <text x={350} y={324} textAnchor="middle" fontSize={8} fill="#94a3b8">
          If any step fails, orchestrator sends compensating commands in reverse order (refund → release stock → cancel order)
        </text>
      </svg>
    </div>
  );
}
