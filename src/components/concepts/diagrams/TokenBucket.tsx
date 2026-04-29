// TokenBucket — token bucket rate limiter diagram

export function TokenBucket() {
  const W = 620, H = 380;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="tb-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="tb-grn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4ade80" />
          </marker>
          <marker id="tb-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
          </marker>
        </defs>

        {/* Bucket body */}
        <rect x={220} y={120} width={180} height={180} rx={4} fill="#1e293b" stroke="#475569" strokeWidth={2} />
        {/* Bucket fill (tokens) */}
        <rect x={222} y={200} width={176} height={98} rx={2} fill="#6366f130" />

        {/* Tokens inside bucket */}
        {[0,1,2,3,4,5].map(i => (
          <circle key={i} cx={250 + (i % 3) * 50} cy={220 + Math.floor(i/3) * 40} r={14}
            fill="#6366f1" opacity={0.8} />
        ))}
        {[0,1,2,3,4,5].map(i => (
          <text key={i} x={250 + (i % 3) * 50} y={225 + Math.floor(i/3) * 40}
            textAnchor="middle" dominantBaseline="middle" fontSize={8} fontWeight={700} fill="#e2e8f0">T</text>
        ))}

        {/* Bucket label */}
        <text x={310} y={148} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8">Token Bucket</text>
        <text x={310} y={162} textAnchor="middle" fontSize={9} fill="#64748b">Capacity: 10 tokens</text>
        <text x={310} y={176} textAnchor="middle" fontSize={9} fill="#64748b">Current: 6 tokens</text>

        {/* Rate label */}
        <text x={310} y={316} textAnchor="middle" fontSize={9} fill="#475569" fontStyle="italic">
          Refill rate: 5 tokens / second
        </text>

        {/* Refill arrow — top, into bucket */}
        <line x1={310} y1={30} x2={310} y2={118} stroke="#4ade80" strokeWidth={2} markerEnd="url(#tb-grn)" />
        <rect x={210} y={0} width={200} height={30} rx={6} fill="#4ade8015" stroke="#4ade80" strokeWidth={1.5} />
        <text x={310} y={19} textAnchor="middle" fontSize={9} fontWeight={700} fill="#4ade80">+ 5 tokens/second (refill)</text>

        {/* Incoming requests */}
        <line x1={30} y1={180} x2={218} y2={180} stroke="#64748b" strokeWidth={2} markerEnd="url(#tb-arr)" />
        <text x={124} y={172} textAnchor="middle" fontSize={9} fill="#94a3b8">Requests</text>
        <text x={124} y={185} textAnchor="middle" fontSize={9} fill="#94a3b8">arrive</text>

        {/* Allowed request — exits bottom right */}
        <line x1={400} y1={200} x2={560} y2={150} stroke="#4ade80" strokeWidth={2} markerEnd="url(#tb-grn)" />
        <rect x={468} y={120} width={130} height={35} rx={6} fill="#4ade8015" stroke="#4ade80" strokeWidth={1.5} />
        <text x={533} y={135} textAnchor="middle" fontSize={9} fontWeight={700} fill="#4ade80">✓ Allowed</text>
        <text x={533} y={148} textAnchor="middle" fontSize={9} fill="#4ade80">1 token consumed</text>

        {/* Rejected request — exits bottom with X */}
        <line x1={400} y1={260} x2={560} y2={300} stroke="#f87171" strokeWidth={2} markerEnd="url(#tb-red)" />
        <rect x={465} y={288} width={130} height={35} rx={6} fill="#f8717115" stroke="#f87171" strokeWidth={1.5} />
        <text x={530} y={303} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">✗ Rejected (429)</text>
        <text x={530} y={316} textAnchor="middle" fontSize={9} fill="#f87171">bucket empty</text>

        {/* Burst label */}
        <text x={54} y={345} fontSize={9} fill="#94a3b8">
          ↳ Burst: up to 10 tokens can be consumed instantly (capacity = max burst)
        </text>
      </svg>
    </div>
  );
}
