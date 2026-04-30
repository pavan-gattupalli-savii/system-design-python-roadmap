// ProxyFlow — side-by-side: Forward Proxy vs Reverse Proxy

export function ProxyFlow() {
  const W = 700, H = 280;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="pf-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="pf-blu" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#6366f1" />
          </marker>
          <marker id="pf-grn" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#34d399" />
          </marker>
        </defs>

        <text x={350} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Forward Proxy vs Reverse Proxy</text>

        {/* Divider */}
        <line x1={350} y1={30} x2={350} y2={260} stroke="#334155" strokeWidth={1} strokeDasharray="6,4" />
        <text x={175} y={45} textAnchor="middle" fontSize={11} fontWeight={800} fill="#6366f1">Forward Proxy</text>
        <text x={525} y={45} textAnchor="middle" fontSize={11} fontWeight={800} fill="#34d399">Reverse Proxy</text>

        {/* ───── FORWARD PROXY ───── */}
        {/* Clients */}
        {[80, 130, 180].map((y, i) => (
          <g key={i}>
            <rect x={14} y={y} width={80} height={30} rx={5} fill="#6366f118" stroke="#6366f150" />
            <text x={54} y={y + 14} textAnchor="middle" fontSize={8} fontWeight={700} fill="#818cf8">Client {i + 1}</text>
            <text x={54} y={y + 24} textAnchor="middle" fontSize={7} fill="#64748b">Corp laptop</text>
            <line x1={94} y1={y + 15} x2={130} y2={y + 15} stroke="#6366f160" strokeWidth={1.2} markerEnd="url(#pf-blu)" />
          </g>
        ))}

        {/* Forward Proxy box */}
        <rect x={130} y={95} width={100} height={60} rx={8} fill="#6366f125" stroke="#6366f1" strokeWidth={2} />
        <text x={180} y={122} textAnchor="middle" fontSize={10} fontWeight={800} fill="#818cf8">FORWARD</text>
        <text x={180} y={136} textAnchor="middle" fontSize={10} fontWeight={800} fill="#818cf8">PROXY</text>
        <text x={180} y={149} textAnchor="middle" fontSize={8} fill="#94a3b8">Squid / VPN</text>

        {/* Forward Proxy → Internet */}
        <line x1={230} y1={125} x2={285} y2={125} stroke="#6366f180" strokeWidth={1.5} markerEnd="url(#pf-blu)" />
        <text x={258} y={118} textAnchor="middle" fontSize={8} fill="#94a3b8">single</text>
        <text x={258} y={128} textAnchor="middle" fontSize={8} fill="#94a3b8">exit IP</text>

        {/* Internet globe */}
        <circle cx={307} cy={125} r={22} fill="#1e2a3a" stroke="#334155" strokeWidth={1.5} />
        <text x={307} y={122} textAnchor="middle" fontSize={14}>🌐</text>
        <text x={307} y={152} textAnchor="middle" fontSize={8} fill="#64748b">Internet</text>

        {/* What server sees note */}
        <rect x={10} y={225} width={330} height={30} rx={5} fill="#6366f110" stroke="#6366f140" />
        <text x={175} y={240} textAnchor="middle" fontSize={8.5} fill="#818cf8">
          Server sees: <tspan fontWeight={700}>proxy IP</tspan>, not client IP
        </text>
        <text x={175} y={252} textAnchor="middle" fontSize={8} fill="#94a3b8">Use: privacy, content filtering, caching, geo bypass</text>

        {/* ───── REVERSE PROXY ───── */}
        {/* Internet client */}
        <circle cx={393} cy={125} r={22} fill="#1e2a3a" stroke="#334155" strokeWidth={1.5} />
        <text x={393} y={122} textAnchor="middle" fontSize={14}>🌐</text>
        <text x={393} y={152} textAnchor="middle" fontSize={8} fill="#64748b">Internet</text>

        {/* Internet → Reverse Proxy */}
        <line x1={415} y1={125} x2={468} y2={125} stroke="#34d39980" strokeWidth={1.5} markerEnd="url(#pf-grn)" />
        <text x={442} y={118} textAnchor="middle" fontSize={8} fill="#94a3b8">single</text>
        <text x={442} y={128} textAnchor="middle" fontSize={8} fill="#94a3b8">public IP</text>

        {/* Reverse Proxy box */}
        <rect x={468} y={95} width={104} height={60} rx={8} fill="#34d39925" stroke="#34d399" strokeWidth={2} />
        <text x={520} y={122} textAnchor="middle" fontSize={10} fontWeight={800} fill="#34d399">REVERSE</text>
        <text x={520} y={136} textAnchor="middle" fontSize={10} fontWeight={800} fill="#34d399">PROXY</text>
        <text x={520} y={149} textAnchor="middle" fontSize={8} fill="#94a3b8">Nginx / HAProxy</text>

        {/* Reverse Proxy → Backends */}
        {[80, 130, 180].map((y, i) => (
          <g key={i}>
            <line x1={572} y1={125} x2={600} y2={y + 15} stroke="#34d39960" strokeWidth={1.2} markerEnd="url(#pf-grn)" />
            <rect x={600} y={y} width={90} height={30} rx={5} fill="#34d39918" stroke="#34d39950" />
            <text x={645} y={y + 14} textAnchor="middle" fontSize={8} fontWeight={700} fill="#34d399">Server {i + 1}</text>
            <text x={645} y={y + 24} textAnchor="middle" fontSize={7} fill="#64748b">192.168.x.x</text>
          </g>
        ))}

        {/* What client sees note */}
        <rect x={360} y={225} width={330} height={30} rx={5} fill="#34d39910" stroke="#34d39940" />
        <text x={525} y={240} textAnchor="middle" fontSize={8.5} fill="#34d399">
          Client sees: <tspan fontWeight={700}>proxy as the server</tspan>
        </text>
        <text x={525} y={252} textAnchor="middle" fontSize={8} fill="#94a3b8">Use: load balancing, SSL termination, caching, WAF</text>
      </svg>
    </div>
  );
}
