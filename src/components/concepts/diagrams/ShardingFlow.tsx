// ShardingFlow — shard key router → 3 shards (range-based example)

export function ShardingFlow() {
  const W = 700, H = 360;

  const shards = [
    { x: 500, y: 40,  label: "Shard 1", range: "user_id 1–3M",  color: "#6366f1" },
    { x: 500, y: 155, label: "Shard 2", range: "user_id 3M–6M", color: "#34d399" },
    { x: 500, y: 270, label: "Shard 3", range: "user_id 6M–9M", color: "#f472b6" },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="sf-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          {shards.map((s, i) => (
            <marker key={i} id={`sf-s${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={s.color} />
            </marker>
          ))}
        </defs>

        {/* Application */}
        <rect x={20} y={150} width={110} height={60} rx={8} fill="#94a3b820" stroke="#94a3b8" strokeWidth={1.5} />
        <text x={75} y={175} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8">APPLICATION</text>
        <text x={75} y={190} textAnchor="middle" fontSize={9} fill="#64748b">Query with</text>
        <text x={75} y={201} textAnchor="middle" fontSize={9} fill="#64748b">user_id=4200000</text>
        <line x1={130} y1={180} x2={208} y2={180} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#sf-arr)" />

        {/* Shard router */}
        <rect x={210} y={125} width={160} height={110} rx={8} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={2} />
        <text x={290} y={158} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24">SHARD ROUTER</text>
        <text x={290} y={174} textAnchor="middle" fontSize={9} fill="#94a3b8">Shard key: user_id</text>
        <text x={290} y={188} textAnchor="middle" fontSize={9} fill="#94a3b8">Strategy: Range</text>
        <text x={290} y={203} textAnchor="middle" fontSize={8} fill="#fbbf24">4.2M → Shard 2</text>
        <text x={290} y={217} textAnchor="middle" fontSize={8} fill="#64748b">(3M–6M range)</text>

        {/* Router → shards */}
        {shards.map((s, i) => {
          const isTarget = i === 1;
          return (
            <g key={i}>
              <line x1={370} y1={180} x2={498} y2={s.y + 60}
                stroke={isTarget ? s.color : `${s.color}55`}
                strokeWidth={isTarget ? 2.5 : 1}
                strokeDasharray={isTarget ? undefined : "4,4"}
                markerEnd={`url(#sf-s${i})`}
              />
              <rect x={500} y={s.y} width={180} height={110} rx={8}
                fill={`${s.color}15`} stroke={s.color}
                strokeWidth={isTarget ? 2 : 1}
                opacity={isTarget ? 1 : 0.5} />
              <text x={590} y={s.y + 28} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.color}>
                {s.label}
              </text>
              <text x={590} y={s.y + 46} textAnchor="middle" fontSize={9} fill="#94a3b8">
                {s.range}
              </text>
              {/* DB cylinder */}
              <ellipse cx={590} cy={s.y + 72} rx={30} ry={8} fill={`${s.color}30`} stroke={s.color} strokeWidth={1} opacity={isTarget ? 1 : 0.4} />
              <rect x={560} y={s.y + 72} width={60} height={28} fill={`${s.color}20`} stroke={s.color} strokeWidth={1} opacity={isTarget ? 1 : 0.4} />
              <ellipse cx={590} cy={s.y + 100} rx={30} ry={8} fill={`${s.color}30`} stroke={s.color} strokeWidth={1} opacity={isTarget ? 1 : 0.4} />
              {isTarget && (
                <text x={662} y={s.y + 64} fontSize={9} fontWeight={700} fill={s.color}>← match!</text>
              )}
            </g>
          );
        })}

        {/* Bottom note */}
        <text x={W/2} y={345} textAnchor="middle" fontSize={9} fill="#475569">
          Only Shard 2 is queried. Cross-shard queries (scatter-gather) hit all shards — avoid them.
        </text>
      </svg>
    </div>
  );
}
