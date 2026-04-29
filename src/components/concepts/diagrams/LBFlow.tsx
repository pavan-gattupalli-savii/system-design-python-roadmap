// LBFlow — load balancer flow: client → LB → server pool with health indicators

export function LBFlow() {
  const W = 700, H = 300;

  const servers = [
    { x: 540, y: 60,  label: "Server A", healthy: true  },
    { x: 540, y: 150, label: "Server B", healthy: true  },
    { x: 540, y: 240, label: "Server C", healthy: false },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="lb-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="lb-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
          </marker>
        </defs>

        {/* Client */}
        <rect x={20} y={120} width={110} height={60} rx={8} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
        <text x={75} y={146} textAnchor="middle" fontSize={11} fontWeight={700} fill="#818cf8">CLIENT</text>
        <text x={75} y={160} textAnchor="middle" fontSize={9} fill="#94a3b8">Browser / Mobile</text>

        {/* Load Balancer */}
        <rect x={270} y={110} width={130} height={80} rx={8} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={2} />
        <text x={335} y={142} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fbbf24">LOAD</text>
        <text x={335} y={157} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fbbf24">BALANCER</text>
        <text x={335} y={174} textAnchor="middle" fontSize={9} fill="#94a3b8">Nginx / HAProxy / ALB</text>

        {/* Client → LB */}
        <line x1={130} y1={150} x2={268} y2={150} stroke="#6366f1" strokeWidth={2} markerEnd="url(#lb-arr)" />
        <text x={200} y={143} textAnchor="middle" fontSize={9} fill="#94a3b8">Request</text>

        {/* LB → Servers */}
        {servers.map((s, i) => {
          const healthy = s.healthy;
          const color = healthy ? "#34d399" : "#f87171";
          const marker = healthy ? "url(#lb-arr)" : "url(#lb-red)";
          const stroke = healthy ? "#64748b" : "#f8717160";
          const dash = healthy ? undefined : "4,4";
          return (
            <g key={i}>
              <line
                x1={400} y1={150} x2={538} y2={s.y + 30}
                stroke={stroke} strokeWidth={1.5}
                markerEnd={marker}
                strokeDasharray={dash}
              />
              {/* Server box */}
              <rect x={540} y={s.y} width={140} height={60} rx={8}
                fill={healthy ? "#34d39920" : "#f8717115"}
                stroke={color} strokeWidth={1.5} />
              <text x={610} y={s.y + 24} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>
                {s.label}
              </text>
              <text x={610} y={s.y + 38} textAnchor="middle" fontSize={9} fill="#94a3b8">
                {healthy ? "CPU 62% · 8 conn" : "UNHEALTHY ✗"}
              </text>
              {/* Health dot */}
              <circle cx={672} cy={s.y + 10} r={5} fill={color} />
              <text x={681} y={s.y + 14} fontSize={8} fill={color}>{healthy ? "●" : "●"}</text>
            </g>
          );
        })}

        {/* Health check arrows from LB to servers */}
        <text x={472} y={66} textAnchor="middle" fontSize={9} fill="#94a3b840" fontStyle="italic">health checks</text>

        {/* Legend */}
        <circle cx={30} cy={278} r={5} fill="#34d399" />
        <text x={40} y={282} fontSize={9} fill="#94a3b8">Healthy — receives traffic</text>
        <circle cx={200} cy={278} r={5} fill="#f87171" />
        <text x={210} y={282} fontSize={9} fill="#94a3b8">Unhealthy — excluded from rotation</text>
      </svg>
    </div>
  );
}
