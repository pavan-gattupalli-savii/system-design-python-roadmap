// DnsResolution — step-by-step DNS resolution chain with numbered steps

export function DnsResolution() {
  const W = 700, H = 380;

  const steps = [
    { x: 50,  y: 60,  label: "Browser",           sub: "DNS Cache",           color: "#6366f1" },
    { x: 210, y: 60,  label: "OS Resolver",        sub: "/etc/hosts",          color: "#818cf8" },
    { x: 380, y: 60,  label: "Recursive\nResolver", sub: "8.8.8.8 or 1.1.1.1", color: "#fbbf24" },
    { x: 550, y: 60,  label: "Root NS",            sub: "a–m.root-servers.net",color: "#34d399" },
    { x: 660, y: 200, label: "TLD NS",             sub: ".com Verisign",       color: "#38bdf8" },
    { x: 550, y: 310, label: "Auth NS",            sub: "Route 53 / CF DNS",   color: "#f472b6" },
    { x: 380, y: 310, label: "Recursive\nResolver", sub: "caches + returns",   color: "#fbbf24" },
    { x: 210, y: 310, label: "OS",                 sub: "caches result",       color: "#818cf8" },
    { x: 50,  y: 310, label: "Browser",            sub: "connect to IP!",      color: "#6366f1" },
  ];

  const stepNums = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨"];

  // Arrows: 0→1, 1→2, 2→3, 3→4, 4→5, 5→6(response), 6→7→8
  const edges = [
    { from: 0, to: 1, phase: "q" }, { from: 1, to: 2, phase: "q" },
    { from: 2, to: 3, phase: "q" }, { from: 3, to: 4, phase: "q" },
    { from: 4, to: 5, phase: "q" }, { from: 5, to: 6, phase: "r" },
    { from: 6, to: 7, phase: "r" }, { from: 7, to: 8, phase: "r" },
  ];

  function cx(n: typeof steps[number]) { return n.x; }
  function cy(n: typeof steps[number]) { return n.y + 50; }

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="dns-q" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="dns-r" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#4ade80" />
          </marker>
        </defs>

        {/* Connection lines */}
        {edges.map((e, i) => {
          const s = steps[e.from], t = steps[e.to];
          const isResp = e.phase === "r";
          return (
            <line key={i}
              x1={cx(s)} y1={cy(s)} x2={cx(t)} y2={cy(t)}
              stroke={isResp ? "#4ade8070" : "#47556970"}
              strokeWidth={1.5}
              markerEnd={isResp ? "url(#dns-r)" : "url(#dns-q)"}
            />
          );
        })}

        {/* Nodes */}
        {steps.map((s, i) => (
          <g key={i}>
            <rect x={s.x - 52} y={s.y} width={104} height={70} rx={8}
              fill={`${s.color}18`} stroke={s.color} strokeWidth={1.5} />
            <text x={s.x} y={s.y + 20} textAnchor="middle" fontSize={9} fontWeight={700} fill="#e2e8f0">
              {stepNums[i]}
            </text>
            <text x={s.x} y={s.y + 35} textAnchor="middle" fontSize={9} fontWeight={700} fill={s.color}>
              {s.label.replace("\n", "")}
            </text>
            <text x={s.x} y={s.y + 50} textAnchor="middle" fontSize={8} fill="#94a3b8">
              {s.sub.length > 18 ? s.sub.slice(0, 18) + "…" : s.sub}
            </text>
          </g>
        ))}

        {/* Phase labels */}
        <text x={340} y={28} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={700}>Query phase →</text>
        <text x={340} y={350} textAnchor="middle" fontSize={10} fill="#4ade80" fontWeight={700}>← Response phase (IP returned)</text>

        {/* Key result */}
        <rect x={130} y={348} width={290} height={24} rx={6} fill="#4ade8015" stroke="#4ade8040" strokeWidth={1} />
        <text x={275} y={364} textAnchor="middle" fontSize={9} fill="#4ade80">
          api.example.com → 93.184.216.34 (A record, TTL 300s)
        </text>
      </svg>
    </div>
  );
}
