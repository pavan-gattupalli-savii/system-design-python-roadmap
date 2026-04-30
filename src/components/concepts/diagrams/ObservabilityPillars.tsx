// ObservabilityPillars — three columns: Logs, Metrics, Traces → Insight

export function ObservabilityPillars() {
  const W = 700, H = 340;

  const pillars = [
    {
      x: 60, color: "#6366f1", label: "LOGS", icon: "📋",
      sub: "What happened?",
      items: ["Structured JSON", "Log levels (ERROR/INFO)", "Request IDs", "Stack traces"],
      tools: "ELK · Loki · Datadog",
    },
    {
      x: 257, color: "#34d399", label: "METRICS", icon: "📊",
      sub: "How much / how fast?",
      items: ["Request rate (RED)", "CPU / memory (USE)", "Latency p50/p99", "Error rate"],
      tools: "Prometheus · Grafana",
    },
    {
      x: 454, color: "#fbbf24", label: "TRACES", icon: "🔗",
      sub: "Why is it slow?",
      items: ["Distributed spans", "Trace context (W3C)", "Sampling strategies", "Critical path"],
      tools: "Jaeger · Tempo · X-Ray",
    },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="op-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#94a3b8" />
          </marker>
        </defs>

        <text x={350} y={22} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">The Three Pillars of Observability</text>

        {pillars.map((p) => (
          <g key={p.label}>
            {/* Pillar column */}
            <rect x={p.x} y={38} width={175} height={220} rx={10} fill={p.color + "12"} stroke={p.color} strokeWidth={2} />

            {/* Header */}
            <rect x={p.x} y={38} width={175} height={46} rx={10} fill={p.color + "30"} stroke={p.color} strokeWidth={2} />
            <text x={p.x + 14} y={58} fontSize={16}>{p.icon}</text>
            <text x={p.x + 36} y={58} fontSize={13} fontWeight={800} fill={p.color}>{p.label}</text>
            <text x={p.x + 88} y={74} textAnchor="middle" fontSize={9} fill="#94a3b8">{p.sub}</text>

            {/* Items */}
            {p.items.map((item, i) => (
              <text key={i} x={p.x + 14} y={108 + i * 22} fontSize={9} fill="#cbd5e1">
                <tspan fill={p.color} fontWeight={700}>›</tspan> {item}
              </text>
            ))}

            {/* Tools chip */}
            <rect x={p.x + 10} y={232} width={155} height={20} rx={4} fill={p.color + "20"} stroke={p.color + "60"} />
            <text x={p.x + 88} y={246} textAnchor="middle" fontSize={8} fill={p.color} fontWeight={600}>{p.tools}</text>
          </g>
        ))}

        {/* Convergence arrows */}
        {[147, 344, 541].map((x, i) => (
          <line key={i} x1={x} y1={258} x2={350} y2={295} stroke="#64748b" strokeWidth={1.5} markerEnd="url(#op-arr)" />
        ))}

        {/* Insight / SLOS box */}
        <rect x={210} y={295} width={280} height={38} rx={8} fill="#f8fafc18" stroke="#64748b" strokeWidth={1.5} />
        <text x={350} y={312} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--text-heading,#f8fafc)">Unified Insight</text>
        <text x={350} y={326} textAnchor="middle" fontSize={9} fill="#94a3b8">SLIs → SLOs → Error Budgets → Alerts</text>

        {/* "Before" call out */}
        <rect x={644} y={38} width={46} height={220} rx={6} fill="#f8717110" stroke="#f8717140" />
        <text
          x={667} y={158}
          fontSize={8}
          fill="#f87171"
          fontWeight={600}
          textAnchor="middle"
          transform="rotate(-90 667 158)"
        >Monitoring = known unknowns &nbsp;·&nbsp; Observability = unknown unknowns</text>
      </svg>
    </div>
  );
}
