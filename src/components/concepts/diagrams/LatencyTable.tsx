// ── LatencyTable ──────────────────────────────────────────────────────────────
// Reference table of latency numbers every engineer should know.

const ROWS = [
  { op: "L1 cache read",                latency: "~1 ns",     magnitude: 1,   category: "CPU",     note: "Fastest possible access" },
  { op: "Branch misprediction penalty", latency: "~5 ns",     magnitude: 1,   category: "CPU",     note: "Modern CPU pipeline flush" },
  { op: "L2 cache read",                latency: "~10 ns",    magnitude: 2,   category: "CPU",     note: "" },
  { op: "Mutex lock/unlock",            latency: "~25 ns",    magnitude: 2,   category: "CPU",     note: "" },
  { op: "Main memory (RAM) read",       latency: "~100 ns",   magnitude: 3,   category: "Memory",  note: "100× slower than L1" },
  { op: "Compress 1 KB (Snappy)",       latency: "~3 µs",     magnitude: 4,   category: "CPU",     note: "" },
  { op: "Read 1 MB sequentially (RAM)", latency: "~250 µs",   magnitude: 5,   category: "Memory",  note: "" },
  { op: "SSD random read",              latency: "~150 µs",   magnitude: 5,   category: "Storage", note: "NVMe; SATA is ~0.5 ms" },
  { op: "Round trip in same datacenter",latency: "~500 µs",   magnitude: 5,   category: "Network", note: "Within one AZ" },
  { op: "Read 1 MB sequentially (SSD)", latency: "~1 ms",     magnitude: 6,   category: "Storage", note: "" },
  { op: "HDD seek",                     latency: "~10 ms",    magnitude: 7,   category: "Storage", note: "Mechanical arm movement" },
  { op: "Read 1 MB sequentially (HDD)", latency: "~20 ms",    magnitude: 7,   category: "Storage", note: "" },
  { op: "Send packet US → EU",          latency: "~80 ms",    magnitude: 8,   category: "Network", note: "Speed of light limit" },
  { op: "DNS lookup (uncached)",        latency: "~50–100 ms",magnitude: 8,   category: "Network", note: "Varies by resolver" },
  { op: "TLS handshake (TLS 1.2)",      latency: "~200 ms",   magnitude: 8,   category: "Network", note: "2 round trips; TLS 1.3 = 1 RTT" },
  { op: "Send packet US → AU",          latency: "~150 ms",   magnitude: 8,   category: "Network", note: "Trans-Pacific" },
  { op: "Satellite round trip",         latency: "~600 ms",   magnitude: 9,   category: "Network", note: "Geostationary orbit" },
];

const CATEGORY_COLORS: Record<string, { bg: string; tx: string }> = {
  CPU:     { bg: "#818cf811", tx: "#818cf8" },
  Memory:  { bg: "#34d39911", tx: "#34d399" },
  Storage: { bg: "#fb923c11", tx: "#fb923c" },
  Network: { bg: "#38bdf811", tx: "#38bdf8" },
};

// Heatmap: magnitude 1 (fastest) → green, 9 (slowest) → red
function heatColor(magnitude: number): string {
  const stops = [
    "#4ade80", "#86efac", "#bef264", "#fde047",
    "#fb923c", "#f87171", "#ef4444", "#dc2626", "#991b1b",
  ];
  return stops[Math.min(magnitude - 1, stops.length - 1)];
}

export function LatencyTable() {
  return (
    <div style={{ overflowX: "auto", marginTop: 20 }}>
      {/* Category legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {Object.entries(CATEGORY_COLORS).map(([cat, style]) => (
          <span key={cat} style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
            background: style.bg, color: style.tx, border: "1px solid " + style.tx + "44",
          }}>
            {cat}
          </span>
        ))}
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4, alignSelf: "center" }}>
          — heatmap: green = fast, red = slow
        </span>
      </div>

      <table style={{
        width: "100%", borderCollapse: "separate", borderSpacing: "0 3px",
        fontSize: 12,
      }}>
        <thead>
          <tr>
            {["Operation", "Latency", "Category", "Note"].map((h, i) => (
              <th key={h} style={{
                padding: "8px 14px",
                textAlign: i === 1 ? "right" : "left",
                fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                textTransform: "uppercase", color: "var(--text-muted)",
                borderBottom: "2px solid var(--border)",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => {
            const cc = CATEGORY_COLORS[row.category] ?? { bg: "transparent", tx: "var(--text-muted)" };
            const bg = i % 2 === 0 ? "var(--bg-page)" : "var(--bg-panel)";
            return (
              <tr key={row.op} style={{ background: bg }}>
                {/* Heatmap strip */}
                <td style={{ padding: "9px 14px", color: "var(--text-heading)", fontWeight: 500 }}>
                  <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: heatColor(row.magnitude), marginRight: 8, verticalAlign: "middle",
                  }} />
                  {row.op}
                </td>
                <td style={{
                  padding: "9px 14px", textAlign: "right", fontFamily: "monospace",
                  fontWeight: 700, fontSize: 12, color: heatColor(row.magnitude),
                  whiteSpace: "nowrap",
                }}>
                  {row.latency}
                </td>
                <td style={{ padding: "9px 14px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                    background: cc.bg, color: cc.tx, border: "1px solid " + cc.tx + "33",
                  }}>
                    {row.category}
                  </span>
                </td>
                <td style={{
                  padding: "9px 14px", color: "var(--text-muted)", fontSize: 11, lineHeight: 1.4,
                }}>
                  {row.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
        Numbers are approximate order-of-magnitude estimates. Actual values vary by hardware, OS, and workload.
        Source: Jeff Dean / Peter Norvig "Latency Numbers Every Programmer Should Know".
      </div>
    </div>
  );
}
