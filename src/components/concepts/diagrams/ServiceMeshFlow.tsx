// ServiceMeshFlow — services + sidecar proxies + control plane

export function ServiceMeshFlow() {
  const W = 700, H = 330;

  const services = [
    { x: 40,  y: 155, name: "Order\nService",   col: "#6366f1" },
    { x: 240, y: 90,  name: "Inventory\nService", col: "#34d399" },
    { x: 240, y: 220, name: "Payment\nService",  col: "#fbbf24" },
    { x: 440, y: 155, name: "Notification\nService", col: "#f87171" },
  ];

  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 3 },
    { from: 1, to: 3 },
  ];

  // Service center points (approximate, accounting for sidecar offsets)
  const cx = (i: number) => services[i].x + 55;
  const cy = (i: number) => services[i].y + 40;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="sm-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#6366f160" />
          </marker>
        </defs>

        {/* Control Plane */}
        <rect x={200} y={10} width={310} height={44} rx={8} fill="#818cf820" stroke="#818cf8" strokeWidth={2} />
        <text x={355} y={30} textAnchor="middle" fontSize={10} fontWeight={800} fill="#818cf8">CONTROL PLANE (istiod)</text>
        <text x={355} y={46} textAnchor="middle" fontSize={8} fill="#94a3b8">xDS config push · certificate issuance · policy distribution</text>

        {/* Control plane → sidecars (config push lines) */}
        {services.map((s, i) => (
          <line key={i} x1={355} y1={54} x2={cx(i)} y2={s.y} stroke="#818cf840" strokeWidth={1} strokeDasharray="4,3" />
        ))}

        {/* Data plane connections between services */}
        {connections.map((c, i) => (
          <line key={i}
            x1={cx(c.from)} y1={cy(c.from)}
            x2={cx(c.to)} y2={cy(c.to)}
            stroke="#34d39930" strokeWidth={3}
            markerEnd="url(#sm-arr)"
          />
        ))}

        {/* Service boxes with sidecars */}
        {services.map((s, i) => (
          <g key={i}>
            {/* Main service box */}
            <rect x={s.x} y={s.y} width={90} height={56} rx={7} fill={s.col + "18"} stroke={s.col} strokeWidth={2} />
            <text x={s.x + 45} y={s.y + 22} textAnchor="middle" fontSize={9} fontWeight={800} fill={s.col}>
              {s.name.split("\n")[0]}
            </text>
            <text x={s.x + 45} y={s.y + 36} textAnchor="middle" fontSize={9} fontWeight={800} fill={s.col}>
              {s.name.split("\n")[1]}
            </text>
            <text x={s.x + 45} y={s.y + 50} textAnchor="middle" fontSize={7} fill="#64748b">HTTP :8080</text>

            {/* Sidecar (Envoy) */}
            <rect x={s.x + 94} y={s.y + 10} width={54} height={36} rx={5} fill="#f8fafc15" stroke="#64748b" strokeWidth={1.5} />
            <text x={s.x + 121} y={s.y + 26} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#94a3b8">Envoy</text>
            <text x={s.x + 121} y={s.y + 38} textAnchor="middle" fontSize={6.5} fill="#475569">sidecar</text>

            {/* mTLS lock between sidecar and adjacent */}
            <text x={s.x + 148} y={s.y + 28} fontSize={9}>🔒</text>
          </g>
        ))}

        {/* DATA PLANE label */}
        <rect x={14} y={265} width={680} height={24} rx={5} fill="#1e293b" stroke="#334155" />
        <text x={354} y={281} textAnchor="middle" fontSize={9} fontWeight={700} fill="#64748b">
          DATA PLANE — all inter-service traffic flows through Envoy sidecars (mTLS encrypted, traced, retry-aware)
        </text>

        {/* Legend */}
        <line x1={20} y1={302} x2={50} y2={302} stroke="#34d39930" strokeWidth={3} />
        <text x={55} y={306} fontSize={8} fill="#94a3b8">mTLS request</text>
        <line x1={150} y1={302} x2={180} y2={302} stroke="#818cf840" strokeWidth={1} strokeDasharray="4,3" />
        <text x={185} y={306} fontSize={8} fill="#94a3b8">xDS config push</text>
        <rect x={300} y={296} width={36} height={14} rx={3} fill="#f8fafc15" stroke="#64748b" />
        <text x={318} y={307} textAnchor="middle" fontSize={7} fill="#94a3b8">Envoy</text>
        <text x={340} y={306} fontSize={8} fill="#94a3b8">sidecar proxy (per pod)</text>
      </svg>
    </div>
  );
}
