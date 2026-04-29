// ReplicationFlow — leader + 2 followers, sync and async replication arrows

export function ReplicationFlow() {
  const W = 700, H = 340;

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="rf-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="rf-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
          </marker>
          <marker id="rf-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#fb923c" />
          </marker>
          <marker id="rf-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4ade80" />
          </marker>
        </defs>

        {/* Client write */}
        <rect x={20} y={100} width={100} height={50} rx={8} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
        <text x={70} y={121} textAnchor="middle" fontSize={10} fontWeight={700} fill="#818cf8">CLIENT</text>
        <text x={70} y={136} textAnchor="middle" fontSize={9} fill="#94a3b8">WRITE</text>
        <line x1={120} y1={125} x2={200} y2={125} stroke="#6366f1" strokeWidth={1.5} markerEnd="url(#rf-arr)" />

        {/* Leader */}
        <rect x={202} y={80} width={140} height={90} rx={8} fill="#fbbf2420" stroke="#fbbf24" strokeWidth={2} />
        <text x={272} y={112} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fbbf24">LEADER</text>
        <text x={272} y={128} textAnchor="middle" fontSize={9} fill="#94a3b8">Primary / Master</text>
        <text x={272} y={146} textAnchor="middle" fontSize={9} fill="#64748b">WAL write → ack</text>
        <text x={272} y={160} textAnchor="middle" fontSize={9} fill="#fbbf24">Accepts writes</text>

        {/* Sync replication → Follower 1 */}
        <line x1={342} y1={100} x2={460} y2={70} stroke="#38bdf8" strokeWidth={2} markerEnd="url(#rf-blue)" />
        <rect x={462} y={40} width={140} height={70} rx={8} fill="#38bdf820" stroke="#38bdf8" strokeWidth={1.5} />
        <text x={532} y={62} textAnchor="middle" fontSize={10} fontWeight={700} fill="#38bdf8">FOLLOWER 1</text>
        <text x={532} y={76} textAnchor="middle" fontSize={9} fill="#94a3b8">Sync replica</text>
        <text x={532} y={90} textAnchor="middle" fontSize={8} fill="#64748b">Must ack before</text>
        <text x={532} y={102} textAnchor="middle" fontSize={8} fill="#64748b">leader acks client</text>
        <text x={400} y={60} textAnchor="middle" fontSize={9} fontWeight={700} fill="#38bdf8">SYNC</text>

        {/* Ack back from follower 1 to leader */}
        <line x1={462} y1={85} x2={342} y2={110} stroke="#38bdf880" strokeWidth={1}
          strokeDasharray="3,3" markerEnd="url(#rf-blue)" />
        <text x={398} y={104} textAnchor="middle" fontSize={8} fill="#38bdf8">ack</text>

        {/* Async replication → Follower 2 */}
        <line x1={342} y1={155} x2={460} y2={220} stroke="#fb923c" strokeWidth={2}
          strokeDasharray="8,4" markerEnd="url(#rf-orange)" />
        <rect x={462} y={190} width={140} height={80} rx={8} fill="#fb923c20" stroke="#fb923c" strokeWidth={1.5} />
        <text x={532} y={216} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fb923c">FOLLOWER 2</text>
        <text x={532} y={230} textAnchor="middle" fontSize={9} fill="#94a3b8">Async replica</text>
        <text x={532} y={244} textAnchor="middle" fontSize={8} fill="#64748b">May lag behind by</text>
        <text x={532} y={256} textAnchor="middle" fontSize={8} fill="#64748b">milliseconds–seconds</text>
        <text x={398} y={196} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fb923c">ASYNC</text>

        {/* Client read from follower */}
        <rect x={20} y={240} width={100} height={50} rx={8} fill="#34d39920" stroke="#34d399" strokeWidth={1.5} />
        <text x={70} y={261} textAnchor="middle" fontSize={10} fontWeight={700} fill="#34d399">CLIENT</text>
        <text x={70} y={276} textAnchor="middle" fontSize={9} fill="#94a3b8">READ</text>
        <line x1={120} y1={265} x2={200} y2={230} stroke="#34d399" strokeWidth={1.5} markerEnd="url(#rf-green)" />
        <rect x={202} y={215} width={140} height={30} rx={4} fill="none" stroke="#34d39940" strokeWidth={1} strokeDasharray="3,3" />
        <text x={272} y={235} textAnchor="middle" fontSize={8} fill="#34d39980">read from follower</text>

        {/* Legend */}
        <line x1={20} y1={318} x2={50} y2={318} stroke="#38bdf8" strokeWidth={2} />
        <text x={55} y={322} fontSize={9} fill="#94a3b8">Synchronous (durability, latency)</text>
        <line x1={260} y1={318} x2={290} y2={318} stroke="#fb923c" strokeWidth={2} strokeDasharray="6,3" />
        <text x={295} y={322} fontSize={9} fill="#94a3b8">Asynchronous (performance, replication lag)</text>
      </svg>
    </div>
  );
}
