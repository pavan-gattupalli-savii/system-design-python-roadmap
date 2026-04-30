// CircuitBreaker — state machine: Closed → Open → Half-Open → Closed

export function CircuitBreaker() {
  const W = 700, H = 320;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="cb-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="cb-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
          </marker>
          <marker id="cb-grn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#34d399" />
          </marker>
          <marker id="cb-yel" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#fbbf24" />
          </marker>
        </defs>

        {/* Title */}
        <text x={350} y={22} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Circuit Breaker State Machine</text>

        {/* ── CLOSED ── */}
        <ellipse cx={140} cy={155} rx={100} ry={55} fill="#34d39918" stroke="#34d399" strokeWidth={2.5} />
        <text x={140} y={148} textAnchor="middle" fontSize={13} fontWeight={800} fill="#34d399">CLOSED</text>
        <text x={140} y={164} textAnchor="middle" fontSize={9} fill="#94a3b8">Normal operation</text>
        <text x={140} y={177} textAnchor="middle" fontSize={9} fill="#94a3b8">Requests pass through</text>

        {/* ── OPEN ── */}
        <ellipse cx={560} cy={155} rx={100} ry={55} fill="#f8717118" stroke="#f87171" strokeWidth={2.5} />
        <text x={560} y={148} textAnchor="middle" fontSize={13} fontWeight={800} fill="#f87171">OPEN</text>
        <text x={560} y={164} textAnchor="middle" fontSize={9} fill="#94a3b8">Fast-fail — all requests</text>
        <text x={560} y={177} textAnchor="middle" fontSize={9} fill="#94a3b8">rejected immediately</text>

        {/* ── HALF-OPEN ── */}
        <ellipse cx={350} cy={268} rx={110} ry={45} fill="#fbbf2418" stroke="#fbbf24" strokeWidth={2.5} />
        <text x={350} y={261} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fbbf24">HALF-OPEN</text>
        <text x={350} y={276} textAnchor="middle" fontSize={9} fill="#94a3b8">Probe requests allowed</text>

        {/* CLOSED → OPEN (failure threshold breached) */}
        <path d="M 238,138 Q 350,60 462,138" fill="none" stroke="#f87171" strokeWidth={2} markerEnd="url(#cb-red)" />
        <text x={350} y={80} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">Failure rate &gt; threshold</text>
        <text x={350} y={92} textAnchor="middle" fontSize={9} fill="#94a3b8">(e.g. 50% errors in 60 s)</text>

        {/* OPEN → HALF-OPEN (reset timer expires) */}
        <path d="M 500,195 Q 430,260 458,265" fill="none" stroke="#fbbf24" strokeWidth={2} markerEnd="url(#cb-yel)" />
        <text x={488} y={250} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fbbf24">Reset timeout</text>
        <text x={488} y={262} textAnchor="middle" fontSize={9} fill="#94a3b8">expires (e.g. 30 s)</text>

        {/* HALF-OPEN → CLOSED (probe succeeds) */}
        <path d="M 244,260 Q 190,240 143,210" fill="none" stroke="#34d399" strokeWidth={2} markerEnd="url(#cb-grn)" />
        <text x={168} y={245} textAnchor="middle" fontSize={9} fontWeight={700} fill="#34d399">Probe success</text>

        {/* HALF-OPEN → OPEN (probe fails) */}
        <path d="M 454,260 Q 510,240 558,210" fill="none" stroke="#f87171" strokeWidth={2} markerEnd="url(#cb-red)" />
        <text x={532} y={245} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">Probe fail</text>

        {/* Request flow labels */}
        <rect x={10} y={230} width={125} height={30} rx={4} fill="#34d39910" stroke="#34d39940" />
        <text x={72} y={245} textAnchor="middle" fontSize={8} fill="#34d399" fontWeight={600}>✓  Request → Service</text>
        <text x={72} y={256} textAnchor="middle" fontSize={8} fill="#94a3b8">metrics recorded</text>

        <rect x={565} y={230} width={128} height={30} rx={4} fill="#f8717110" stroke="#f8717140" />
        <text x={629} y={245} textAnchor="middle" fontSize={8} fill="#f87171" fontWeight={600}>✗  CallNotPermittedException</text>
        <text x={629} y={256} textAnchor="middle" fontSize={8} fill="#94a3b8">fallback invoked</text>
      </svg>
    </div>
  );
}
