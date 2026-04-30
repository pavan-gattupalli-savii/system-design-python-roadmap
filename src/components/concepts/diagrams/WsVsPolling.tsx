// WsVsPolling — horizontal timeline: Polling vs Long-Poll vs SSE vs WebSocket

export function WsVsPolling() {
  const W = 700, H = 310;

  const strategies = [
    {
      y: 50,  label: "Short Polling",     color: "#f87171",
      desc: "Client requests every N seconds",
      // 4 req/resp pairs, many empty
      events: [
        { t: 0.05, type: "req" }, { t: 0.15, type: "resp-empty" },
        { t: 0.25, type: "req" }, { t: 0.35, type: "resp-empty" },
        { t: 0.45, type: "req" }, { t: 0.55, type: "resp-data" },
        { t: 0.65, type: "req" }, { t: 0.75, type: "resp-empty" },
      ],
    },
    {
      y: 120, label: "Long Polling",      color: "#fbbf24",
      desc: "Server holds request until data is ready",
      events: [
        { t: 0.05, type: "req" }, { t: 0.48, type: "resp-data" },
        { t: 0.50, type: "req" }, { t: 0.85, type: "resp-data" },
      ],
    },
    {
      y: 190, label: "SSE (one-way)",     color: "#6366f1",
      desc: "Single long-lived HTTP stream, server pushes",
      events: [
        { t: 0.05, type: "connect" },
        { t: 0.20, type: "push" },
        { t: 0.40, type: "push" },
        { t: 0.65, type: "push" },
        { t: 0.85, type: "push" },
      ],
    },
    {
      y: 260, label: "WebSocket",         color: "#34d399",
      desc: "Full-duplex — client & server both send",
      events: [
        { t: 0.04, type: "connect" },
        { t: 0.15, type: "push" }, { t: 0.20, type: "client-msg" },
        { t: 0.35, type: "push" }, { t: 0.50, type: "client-msg" },
        { t: 0.60, type: "push" }, { t: 0.75, type: "push" },
        { t: 0.90, type: "client-msg" },
      ],
    },
  ];

  const TIME_X0 = 120, TIME_W = 540;
  const ROW_H = 34;

  function xOf(t: number) { return TIME_X0 + t * TIME_W; }

  const eventColors: Record<string, string> = {
    "req": "#94a3b8",
    "resp-empty": "#334155",
    "resp-data": "#fbbf24",
    "connect": "#6366f1",
    "push": "#34d399",
    "client-msg": "#818cf8",
  };
  const eventLabels: Record<string, string> = {
    "req": "req", "resp-empty": "∅", "resp-data": "data",
    "connect": "WS/SSE connect", "push": "push", "client-msg": "send",
  };

  return (
    <div style={{ overflowX: "auto", margin: "20px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}>
        <text x={350} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--text-heading,#f8fafc)">Real-Time Transport Strategies</text>

        {/* Timeline axis */}
        <line x1={TIME_X0} y1={28} x2={TIME_X0 + TIME_W} y2={28} stroke="#334155" strokeWidth={1} />
        <text x={TIME_X0} y={24} fontSize={8} fill="#475569">t=0</text>
        <text x={TIME_X0 + TIME_W} y={24} textAnchor="end" fontSize={8} fill="#475569">time →</text>

        {strategies.map((s) => {
          const cy = s.y;
          return (
            <g key={s.label}>
              {/* Label */}
              <text x={8} y={cy} fontSize={10} fontWeight={800} fill={s.color}>{s.label}</text>
              <text x={8} y={cy + 12} fontSize={8} fill="#64748b" style={{ maxWidth: 100 }}>{s.desc}</text>

              {/* Row baseline */}
              <line x1={TIME_X0} y1={cy + 2} x2={TIME_X0 + TIME_W} y2={cy + 2} stroke="#1e293b" strokeWidth={ROW_H} />
              <line x1={TIME_X0} y1={cy + 2} x2={TIME_X0 + TIME_W} y2={cy + 2} stroke={s.color + "18"} strokeWidth={ROW_H} />

              {/* Connection bar for SSE / WS */}
              {(s.label === "SSE (one-way)" || s.label === "WebSocket") && (
                <line x1={xOf(0.04)} y1={cy + 2} x2={xOf(0.96)} y2={cy + 2}
                  stroke={s.color + "50"} strokeWidth={3} />
              )}

              {/* Events */}
              {s.events.map((ev, i) => {
                const x = xOf(ev.t);
                const col = eventColors[ev.type] || "#94a3b8";
                const lbl = eventLabels[ev.type] || ev.type;
                const isDown = ev.type === "req" || ev.type === "client-msg";
                return (
                  <g key={i}>
                    <circle cx={x} cy={cy + 2} r={5} fill={col} />
                    <text x={x} y={isDown ? cy + 22 : cy - 10}
                      textAnchor="middle" fontSize={7} fill={col} fontWeight={600}>{lbl}</text>
                  </g>
                );
              })}

              {/* Request-response arcs for polling */}
              {(s.label === "Short Polling" || s.label === "Long Polling") && (() => {
                const pairs: Array<[number, number, string]> = [];
                for (let i = 0; i < s.events.length - 1; i += 2) {
                  pairs.push([s.events[i].t, s.events[i + 1].t, s.events[i + 1].type]);
                }
                return pairs.map(([t1, t2, type], pi) => {
                  const x1 = xOf(t1), x2 = xOf(t2);
                  const col = type === "resp-data" ? "#fbbf2460" : "#33415560";
                  return (
                    <line key={pi} x1={x1} y1={cy + 2} x2={x2} y2={cy + 2}
                      stroke={col} strokeWidth={2} strokeDasharray="3,2" />
                  );
                });
              })()}
            </g>
          );
        })}

        {/* Legend */}
        {[
          { col: "#94a3b8", lbl: "request" },
          { col: "#334155", lbl: "empty response" },
          { col: "#fbbf24", lbl: "data response" },
          { col: "#34d399", lbl: "server push" },
          { col: "#818cf8", lbl: "client message" },
        ].map((l, i) => (
          <g key={i}>
            <circle cx={22 + i * 130} cy={295} r={4} fill={l.col} />
            <text x={30 + i * 130} y={299} fontSize={8} fill="#94a3b8">{l.lbl}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
