// CacheHitMiss — request flow through a cache layer, showing hit and miss paths

export function CacheHitMiss() {
  const W = 720, H = 320;
  const BOX = { rx: 8 };

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="chm-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="chm-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4ade80" />
          </marker>
          <marker id="chm-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
          </marker>
        </defs>

        {/* Client */}
        <rect x={20} y={130} width={100} height={60} rx={BOX.rx} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
        <text x={70} y={156} textAnchor="middle" fontSize={11} fontWeight={700} fill="#818cf8">CLIENT</text>
        <text x={70} y={172} textAnchor="middle" fontSize={9} fill="#94a3b8">Browser / App</text>

        {/* Cache */}
        <rect x={280} y={115} width={120} height={90} rx={BOX.rx} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={1.5} />
        <text x={340} y={152} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24">CACHE</text>
        <text x={340} y={168} textAnchor="middle" fontSize={9} fill="#94a3b8">Redis / Memcached</text>
        <text x={340} y={182} textAnchor="middle" fontSize={9} fill="#94a3b8">In-memory</text>

        {/* DB */}
        <rect x={560} y={130} width={120} height={60} rx={BOX.rx} fill="#34d39920" stroke="#34d399" strokeWidth={1.5} />
        <text x={620} y={155} textAnchor="middle" fontSize={11} fontWeight={700} fill="#34d399">DATABASE</text>
        <text x={620} y={171} textAnchor="middle" fontSize={9} fill="#94a3b8">Persistent store</text>

        {/* Arrow: Client → Cache (request) */}
        <line x1={120} y1={155} x2={278} y2={155} stroke="#64748b" strokeWidth={1.5} markerEnd="url(#chm-arr)" />
        <text x={200} y={148} textAnchor="middle" fontSize={9} fill="#94a3b8">Request</text>

        {/* HIT path — response from cache back to client */}
        <path d="M280,148 Q200,90 120,148" fill="none" stroke="#4ade80" strokeWidth={1.5} markerEnd="url(#chm-green)" strokeDasharray="5,3" />
        <text x={200} y={100} textAnchor="middle" fontSize={9} fontWeight={700} fill="#4ade80">✓ CACHE HIT</text>
        <text x={200} y={113} textAnchor="middle" fontSize={8} fill="#4ade80">Return cached value</text>

        {/* MISS path — cache → DB */}
        <line x1={400} y1={165} x2={558} y2={165} stroke="#f87171" strokeWidth={1.5} markerEnd="url(#chm-red)" />
        <text x={480} y={158} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">✗ CACHE MISS</text>

        {/* DB → cache (populate) */}
        <path d="M560,178 Q480,230 402,183" fill="none" stroke="#fbbf24" strokeWidth={1.5} markerEnd="url(#chm-arr)" />
        <text x={480} y={232} textAnchor="middle" fontSize={9} fill="#fbbf24">Populate cache</text>

        {/* DB → Client (final response on miss) */}
        <path d="M560,155 Q340,270 120,163" fill="none" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4,4" markerEnd="url(#chm-arr)" />
        <text x={340} y={283} textAnchor="middle" fontSize={9} fill="#64748b">Response (on miss)</text>

        {/* Legend */}
        <rect x={20} y={270} width={8} height={3} fill="#4ade80" rx={1} />
        <text x={32} y={275} fontSize={9} fill="#94a3b8">Cache hit — fast path (~1ms)</text>
        <rect x={200} y={270} width={8} height={3} fill="#f87171" rx={1} />
        <text x={212} y={275} fontSize={9} fill="#94a3b8">Cache miss — slow path (~50-200ms)</text>
        <rect x={460} y={270} width={8} height={3} fill="#fbbf24" rx={1} />
        <text x={472} y={275} fontSize={9} fill="#94a3b8">Cache fill (after miss)</text>
      </svg>
    </div>
  );
}
