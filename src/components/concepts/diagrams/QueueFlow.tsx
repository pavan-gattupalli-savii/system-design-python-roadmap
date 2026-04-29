// QueueFlow — producer → queue → consumers + DLQ branch

export function QueueFlow() {
  const W = 700, H = 360;

  const consumers = [
    { x: 550, y: 60,  label: "Consumer 1" },
    { x: 550, y: 160, label: "Consumer 2" },
    { x: 550, y: 260, label: "Consumer 3" },
  ];

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <defs>
          <marker id="qf-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="qf-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f87171" />
          </marker>
        </defs>

        {/* Producer */}
        <rect x={20} y={140} width={120} height={60} rx={8} fill="#6366f120" stroke="#6366f1" strokeWidth={1.5} />
        <text x={80} y={166} textAnchor="middle" fontSize={11} fontWeight={700} fill="#818cf8">PRODUCER</text>
        <text x={80} y={181} textAnchor="middle" fontSize={9} fill="#94a3b8">Order Service</text>

        {/* Arrow: producer → queue */}
        <line x1={140} y1={170} x2={210} y2={170} stroke="#64748b" strokeWidth={2} markerEnd="url(#qf-arr)" />

        {/* Queue box */}
        <rect x={212} y={110} width={150} height={120} rx={8} fill="#fbbf2418" stroke="#fbbf24" strokeWidth={2} />
        <text x={287} y={133} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fbbf24">MESSAGE QUEUE</text>
        <text x={287} y={147} textAnchor="middle" fontSize={9} fill="#94a3b8">Kafka / RabbitMQ / SQS</text>
        {/* Stacked messages in queue */}
        {[0,1,2,3].map(i => (
          <rect key={i} x={228} y={152 + i * 16} width={118} height={13} rx={3}
            fill="#fbbf2430" stroke="#fbbf2460" strokeWidth={1} />
        ))}
        {[0,1,2,3].map(i => (
          <text key={i} x={287} y={162 + i * 16} textAnchor="middle" fontSize={8} fill="#fbbf24">msg_{i+1}</text>
        ))}

        {/* Queue → consumers */}
        {consumers.map((c, i) => (
          <g key={i}>
            <line x1={362} y1={170} x2={548} y2={c.y + 30}
              stroke="#64748b" strokeWidth={1.5} markerEnd="url(#qf-arr)" />
            <rect x={550} y={c.y} width={130} height={60} rx={8}
              fill="#34d39920" stroke="#34d399" strokeWidth={1.5} />
            <text x={615} y={c.y + 25} textAnchor="middle" fontSize={10} fontWeight={700} fill="#34d399">
              {c.label}
            </text>
            <text x={615} y={c.y + 40} textAnchor="middle" fontSize={9} fill="#94a3b8">
              Email / SMS / etc.
            </text>
          </g>
        ))}

        {/* DLQ branch — failed messages from Consumer 3 */}
        <line x1={550} y1={305} x2={380} y2={340} stroke="#f87171" strokeWidth={1.5}
          strokeDasharray="5,3" markerEnd="url(#qf-red)" />
        <rect x={210} y={320} width={168} height={40} rx={8}
          fill="#f8717115" stroke="#f87171" strokeWidth={1.5} />
        <text x={294} y={337} textAnchor="middle" fontSize={10} fontWeight={700} fill="#f87171">
          Dead Letter Queue
        </text>
        <text x={294} y={351} textAnchor="middle" fontSize={9} fill="#94a3b8">
          After 3 retry failures
        </text>

        {/* DLQ to retry label */}
        <text x={465} y={348} textAnchor="middle" fontSize={9} fill="#f87171" fontStyle="italic">
          ↑ failed after 3 retries
        </text>
      </svg>
    </div>
  );
}
