// HashRing — consistent hashing ring with physical nodes and vnodes

export function HashRing() {
  const W = 560, H = 560;
  const CX = 280, CY = 280, R = 200, VR = 218;

  const nodes = [
    { label: "Node A", angle: -90,  color: "#6366f1" },
    { label: "Node B", angle: -18,  color: "#34d399" },
    { label: "Node C", angle:  54,  color: "#fbbf24" },
    { label: "Node D", angle: 126,  color: "#f472b6" },
    { label: "Node E", angle: 198,  color: "#38bdf8" },
  ];

  // vnodes per physical node (3 each)
  const vnodes = nodes.flatMap((n, ni) =>
    [-28, -8, 16].map((dAngle, vi) => ({
      angle: n.angle + dAngle,
      color: n.color,
      id: `${n.label[5]}${vi + 1}`,
    }))
  );

  // Sample keys
  const keys = [
    { angle: -55, label: "user:42" },
    { angle: 30,  label: "order:9" },
    { angle: 170, label: "cache:x" },
  ];

  function polar(angleDeg: number, radius: number) {
    const r = (angleDeg * Math.PI) / 180;
    return { x: CX + radius * Math.cos(r), y: CY + radius * Math.sin(r) };
  }

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        {/* Outer ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#334155" strokeWidth={2} />

        {/* Vnodes (small dots on ring) */}
        {vnodes.map((v, i) => {
          const p = polar(v.angle, R);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={6} fill={v.color} opacity={0.7} />
              <text x={polar(v.angle, R + 18).x} y={polar(v.angle, R + 18).y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fill={v.color} opacity={0.8}>{v.id}</text>
            </g>
          );
        })}

        {/* Physical nodes (larger circles with labels further out) */}
        {nodes.map((n, i) => {
          const p = polar(n.angle, R);
          const label = polar(n.angle, R + 56);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={12} fill={n.color} opacity={0.9} />
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fontWeight={800} fill="#0f172a">{n.label[5]}</text>
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontWeight={700} fill={n.color}>{n.label}</text>
            </g>
          );
        })}

        {/* Key positions on ring */}
        {keys.map((k, i) => {
          const p = polar(k.angle, R);
          // find next clockwise vnode → node
          const lp = polar(k.angle, R - 34);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#e2e8f0" stroke="#64748b" strokeWidth={1} />
              <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                fontSize={8} fill="#94a3b8">{k.label}</text>
            </g>
          );
        })}

        {/* Center label */}
        <text x={CX} y={CY - 14} textAnchor="middle" fontSize={13} fontWeight={700} fill="#e2e8f0">Hash</text>
        <text x={CX} y={CY + 2} textAnchor="middle" fontSize={13} fontWeight={700} fill="#e2e8f0">Ring</text>
        <text x={CX} y={CY + 20} textAnchor="middle" fontSize={9} fill="#64748b">0 ——— 2³²</text>

        {/* Legend */}
        {nodes.map((n, i) => (
          <g key={i} transform={`translate(${20 + i * 104}, 522)`}>
            <circle cx={6} cy={6} r={6} fill={n.color} opacity={0.9} />
            <text x={16} y={10} fontSize={9} fill="#94a3b8">{n.label}</text>
          </g>
        ))}
        <text x={CX} y={548} textAnchor="middle" fontSize={9} fill="#475569">
          Small dots = virtual nodes (vnodes) — each physical node owns multiple ring positions
        </text>
      </svg>
    </div>
  );
}
