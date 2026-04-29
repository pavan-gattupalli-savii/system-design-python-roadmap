// MicroservicesFlow — client → API Gateway → 4 services (each with own DB) + message bus

export function MicroservicesFlow() {
  const W = 720, H = 420;

  const services = [
    { x: 490, y: 30,  label: "User Service",    color: "#6366f1", dbColor: "#6366f1" },
    { x: 620, y: 130, label: "Order Service",   color: "#34d399", dbColor: "#34d399" },
    { x: 620, y: 250, label: "Payment Service", color: "#fbbf24", dbColor: "#fbbf24" },
    { x: 490, y: 330, label: "Notif. Service",  color: "#f472b6", dbColor: "#f472b6" },
  ];

  const BUS_Y = 200;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="ms-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#64748b" />
          </marker>
          <marker id="ms-bus" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#f472b690" />
          </marker>
          {services.map((s, i) => (
            <marker key={i} id={`ms-s${i}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={s.color} />
            </marker>
          ))}
        </defs>

        {/* Client */}
        <rect x={20} y={160} width={90} height={60} rx={8} fill="#94a3b820" stroke="#94a3b8" strokeWidth={1.5} />
        <text x={65} y={185} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8">CLIENT</text>
        <text x={65} y={200} textAnchor="middle" fontSize={9} fill="#64748b">Browser / App</text>
        <line x1={110} y1={190} x2={178} y2={190} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#ms-arr)" />

        {/* API Gateway */}
        <rect x={180} y={140} width={140} height={100} rx={8} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={2} />
        <text x={250} y={170} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24">API GATEWAY</text>
        <text x={250} y={186} textAnchor="middle" fontSize={9} fill="#94a3b8">Auth · Rate limit</text>
        <text x={250} y={200} textAnchor="middle" fontSize={9} fill="#94a3b8">Routing · SSL</text>
        <text x={250} y={215} textAnchor="middle" fontSize={9} fill="#64748b">Kong / Nginx / ALB</text>

        {/* Gateway → Services */}
        {services.map((s, i) => {
          const sx = s.x - 70, sy = s.y + 35;
          return (
            <line key={i} x1={320} y1={190} x2={sx} y2={sy}
              stroke={s.color} strokeWidth={1.5} markerEnd={`url(#ms-s${i})`} />
          );
        })}

        {/* Services + DBs */}
        {services.map((s, i) => (
          <g key={i}>
            {/* Service box */}
            <rect x={s.x - 70} y={s.y} width={130} height={60} rx={8}
              fill={`${s.color}18`} stroke={s.color} strokeWidth={1.5} />
            <text x={s.x - 5} y={s.y + 22} textAnchor="middle" fontSize={9} fontWeight={700} fill={s.color}>
              {s.label}
            </text>
            <text x={s.x - 5} y={s.y + 37} textAnchor="middle" fontSize={8} fill="#64748b">
              Deploys independently
            </text>
            <text x={s.x - 5} y={s.y + 50} textAnchor="middle" fontSize={8} fill="#64748b">
              Own process + DB
            </text>

            {/* DB cylinder */}
            <ellipse cx={s.x + 86} cy={s.y + 18} rx={22} ry={7} fill={`${s.color}25`} stroke={s.color} strokeWidth={1} />
            <rect x={s.x + 64} y={s.y + 18} width={44} height={28} fill={`${s.color}15`} stroke={s.color} strokeWidth={1} />
            <ellipse cx={s.x + 86} cy={s.y + 46} rx={22} ry={7} fill={`${s.color}25`} stroke={s.color} strokeWidth={1} />

            {/* Line from service to DB */}
            <line x1={s.x + 60} y1={s.y + 30} x2={s.x + 64} y2={s.y + 30}
              stroke={s.color} strokeWidth={1} />
          </g>
        ))}

        {/* Message Bus (horizontal bar) */}
        <rect x={180} y={BUS_Y - 12} width={280} height={24} rx={6}
          fill="#f472b618" stroke="#f472b6" strokeWidth={1.5} />
        <text x={320} y={BUS_Y + 5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f472b6">
          Message Bus (Kafka / RabbitMQ)
        </text>

        {/* Services connect to bus */}
        {services.map((s, i) => {
          const busX = 220 + i * 60;
          return (
            <line key={i} x1={busX} y1={BUS_Y + 12} x2={s.x - 5} y2={s.y + 60}
              stroke="#f472b640" strokeWidth={1} strokeDasharray="4,3" />
          );
        })}

        {/* Bottom legend */}
        <rect x={20} y={390} width={680} height={24} rx={6} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        <text x={360} y={406} textAnchor="middle" fontSize={9} fill="#94a3b8">
          Each service has its own database — no shared DB. Cross-service state via events (Saga pattern).
        </text>
      </svg>
    </div>
  );
}
