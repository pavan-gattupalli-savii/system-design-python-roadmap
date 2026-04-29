// CdnFlow — user → CDN PoP → cache hit vs miss → origin

export function CdnFlow() {
  const W = 700, H = 340;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="cdn-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="cdn-grn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4ade80" />
          </marker>
          <marker id="cdn-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
          </marker>
          <marker id="cdn-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* User */}
        <rect x={20} y={130} width={100} height={60} rx={8} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
        <text x={70} y={155} textAnchor="middle" fontSize={11} fontWeight={700} fill="#818cf8">USER</text>
        <text x={70} y={170} textAnchor="middle" fontSize={9} fill="#94a3b8">Sydney, AU</text>
        <text x={70} y={183} textAnchor="middle" fontSize={9} fill="#94a3b8">5ms from PoP</text>

        {/* User → PoP */}
        <line x1={120} y1={160} x2={210} y2={160} stroke="#6366f1" strokeWidth={1.5} markerEnd="url(#cdn-arr)" />
        <text x={165} y={152} textAnchor="middle" fontSize={9} fill="#94a3b8">Request</text>

        {/* CDN PoP */}
        <rect x={212} y={100} width={160} height={120} rx={8} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={2} />
        <text x={292} y={128} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24">CDN PoP</text>
        <text x={292} y={143} textAnchor="middle" fontSize={9} fill="#94a3b8">Sydney Edge Server</text>
        <text x={292} y={158} textAnchor="middle" fontSize={9} fill="#fbbf24">Cloudflare / Akamai</text>
        <rect x={228} y={167} width={128} height={28} rx={4} fill="#fbbf2415" stroke="#fbbf2460" strokeWidth={1} />
        <text x={292} y={182} textAnchor="middle" fontSize={9} fill="#94a3b8">Local cache storage</text>
        <text x={292} y={195} textAnchor="middle" fontSize={8} fill="#64748b">~500GB SSD per PoP</text>

        {/* CACHE HIT path — back to user */}
        <path d="M212,148 Q165,80 120,148" fill="none" stroke="#4ade80" strokeWidth={2} markerEnd="url(#cdn-grn)" />
        <text x={164} y={96} textAnchor="middle" fontSize={10} fontWeight={700} fill="#4ade80">✓ CACHE HIT</text>
        <text x={164} y={110} textAnchor="middle" fontSize={8} fill="#4ade80">~5ms from PoP</text>
        <text x={164} y={122} textAnchor="middle" fontSize={8} fill="#64748b">no origin request!</text>

        {/* CACHE MISS path — PoP → Origin */}
        <line x1={372} y1={155} x2={490} y2={155} stroke="#f87171" strokeWidth={2}
          strokeDasharray="6,3" markerEnd="url(#cdn-red)" />
        <text x={432} y={146} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">CACHE MISS</text>

        {/* Origin */}
        <rect x={492} y={110} width={180} height={90} rx={8} fill="#34d39920" stroke="#34d399" strokeWidth={1.5} />
        <text x={582} y={138} textAnchor="middle" fontSize={11} fontWeight={700} fill="#34d399">ORIGIN SERVER</text>
        <text x={582} y={154} textAnchor="middle" fontSize={9} fill="#94a3b8">US-East (Virginia)</text>
        <text x={582} y={168} textAnchor="middle" fontSize={9} fill="#64748b">~200ms from Sydney</text>
        <text x={582} y={183} textAnchor="middle" fontSize={9} fill="#94a3b8">Your app/storage</text>

        {/* Origin → PoP (fill cache) */}
        <path d="M492,170 Q430,240 374,172" fill="none" stroke="#fbbf24" strokeWidth={1.5} markerEnd="url(#cdn-arr)" />
        <text x={432} y={236} textAnchor="middle" fontSize={9} fill="#fbbf24">Cache fill (store at PoP)</text>

        {/* Miss response to user */}
        <path d="M212,185 Q100,260 70,192" fill="none" stroke="#64748b" strokeWidth={1}
          strokeDasharray="4,4" markerEnd="url(#cdn-arr)" />
        <text x={100} y={262} textAnchor="middle" fontSize={8} fill="#64748b">Response on miss (~205ms)</text>

        {/* Latency comparison */}
        <rect x={20} y={300} width={660} height={30} rx={6} fill="#1e293b" stroke="#334155" strokeWidth={1} />
        <text x={80} y={320} textAnchor="middle" fontSize={9} fontWeight={700} fill="#4ade80">HIT: ~5ms</text>
        <text x={240} y={320} textAnchor="middle" fontSize={9} fontWeight={700} fill="#f87171">MISS: ~205ms</text>
        <text x={450} y={320} textAnchor="middle" fontSize={9} fill="#94a3b8">Cache-Control: max-age=86400 → PoP caches for 24h</text>
      </svg>
    </div>
  );
}
