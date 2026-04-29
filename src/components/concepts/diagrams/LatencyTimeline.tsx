// ── LatencyTimeline ────────────────────────────────────────────────────────────
// SVG visualisation of where time is spent in an HTTP request round-trip.
// Uses CSS custom properties so it adapts automatically to dark / light mode.

export function LatencyTimeline() {
  const BAR_H   = 36;
  const TRACK_Y = 80;
  const W       = 700;
  const H       = 260;

  // Segments: [label, colour, width fraction (of 620 usable px), popover note]
  const segments = [
    { label: "DNS",        color: "#818cf8", frac: 0.08, ms: "~50 ms",  note: "Hostname → IP. Free if cached." },
    { label: "TCP",        color: "#34d399", frac: 0.10, ms: "~1 RTT",  note: "3-way handshake before any data." },
    { label: "TLS",        color: "#fb923c", frac: 0.14, ms: "~1–2 RTT",note: "TLS 1.3 cuts this to 1 RTT." },
    { label: "Server",     color: "#f472b6", frac: 0.30, ms: "varies",  note: "Business logic + DB + cache." },
    { label: "Transfer",   color: "#38bdf8", frac: 0.24, ms: "varies",  note: "Response payload over the wire." },
    { label: "Last-mile",  color: "#a78bfa", frac: 0.14, ms: "~20 ms",  note: "ISP → user device. Least predictable." },
  ];

  const USABLE = W - 80; // left margin 40, right margin 40
  let cx = 40;
  const rects = segments.map((s) => {
    const w = Math.round(s.frac * USABLE);
    const r = { ...s, x: cx, w };
    cx += w;
    return r;
  });

  return (
    <div style={{ overflowX: "auto", marginTop: 20, marginBottom: 8 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W, display: "block", fontFamily: "inherit" }}
        aria-label="HTTP request latency breakdown timeline"
      >
        {/* Background */}
        <rect x={0} y={0} width={W} height={H} fill="transparent" />

        {/* Axis label */}
        <text x={40} y={28} fontSize={11} fill="var(--text-muted)" fontWeight={600} letterSpacing={1}>
          TIME →
        </text>
        <text x={W - 40} y={28} fontSize={10} fill="var(--text-muted)" textAnchor="end">
          Total ≈ DNS + TCP + TLS + Server + Transfer + Last-mile
        </text>

        {/* Track background */}
        <rect x={40} y={TRACK_Y} width={USABLE} height={BAR_H} rx={6} fill="var(--bg-secondary)" />

        {/* Segments */}
        {rects.map((s, i) => (
          <g key={s.label}>
            <rect
              x={s.x} y={TRACK_Y} width={s.w} height={BAR_H}
              rx={i === 0 ? 6 : i === rects.length - 1 ? 6 : 0}
              fill={s.color}
              opacity={0.85}
            />
            {/* Label inside bar if wide enough */}
            {s.w > 44 && (
              <text
                x={s.x + s.w / 2} y={TRACK_Y + BAR_H / 2 + 4}
                fontSize={10} fontWeight={700} fill="#fff"
                textAnchor="middle" style={{ pointerEvents: "none" }}
              >
                {s.label}
              </text>
            )}
          </g>
        ))}

        {/* Tick marks + annotations below bar */}
        {rects.map((s) => {
          const midX = s.x + s.w / 2;
          return (
            <g key={"tick-" + s.label}>
              {/* tick */}
              <line x1={midX} y1={TRACK_Y + BAR_H} x2={midX} y2={TRACK_Y + BAR_H + 12}
                stroke={s.color} strokeWidth={1.5} />
              {/* label */}
              <text x={midX} y={TRACK_Y + BAR_H + 26}
                fontSize={9} fill={s.color} textAnchor="middle" fontWeight={700}>
                {s.label}
              </text>
              {/* ms hint */}
              <text x={midX} y={TRACK_Y + BAR_H + 39}
                fontSize={8} fill="var(--text-muted)" textAnchor="middle">
                {s.ms}
              </text>
            </g>
          );
        })}

        {/* Note below */}
        <text x={W / 2} y={H - 12} fontSize={10} fill="var(--text-muted)" textAnchor="middle">
          Width of each segment is proportional to its typical share of total latency (rough approximation)
        </text>
      </svg>

      {/* Legend cards */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16,
      }}>
        {segments.map((s) => (
          <div key={s.label} style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
            borderRadius: 8, padding: "8px 12px", fontSize: 12, flex: "1 1 200px",
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 3, background: s.color,
              flexShrink: 0, marginTop: 2,
            }} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-heading)", marginBottom: 2 }}>
                {s.label} <span style={{ fontWeight: 400, color: s.color, fontSize: 11 }}>{s.ms}</span>
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 11, lineHeight: 1.4 }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
