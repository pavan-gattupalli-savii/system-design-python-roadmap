// ── TIMELINE PANEL ────────────────────────────────────────────────────────────
// Clean numbered roadmap thread. Vertical line connects phase nodes (circles
// with 1, 2, 3 … 9). Clicking a phase navigates to it — week detail shows in
// the right panel. No inline accordion expansion.

import { getPhaseStats } from "../utils/stats";
import type { Phase }    from "../data/models";

interface Props {
  roadmap:       Phase[];
  selPhase:      number;
  isMobile:      boolean;
  width:         number;
  completed:     Set<string>;
  isDark:        boolean;
  selectPhase:   (ph: number) => void;
  setMobileView: (v: string) => void;
}

export function TimelinePanel({
  roadmap, selPhase, isMobile, width,
  completed, isDark, selectPhase, setMobileView,
}: Props) {

  const successColor = isDark ? "#4ade80" : "#16a34a";
  const totalWeeks   = roadmap.reduce((s, p) => s + p.weeks.length, 0);

  return (
    <div
      style={{
        width:         isMobile ? "100%" : width,
        flexShrink:    0,
        display:       "flex",
        flexDirection: "column",
        borderRight:   isMobile ? "none" : "1px solid var(--border)",
        background:    "var(--bg-panel)",
        overflow:      "hidden",
      }}
    >
      {/* ── Panel header ── */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 3 }}>
          Roadmap
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {roadmap.length} phases · {totalWeeks} weeks
        </div>
      </div>

      {/* ── Thread scroll area ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px 32px" }}>
        {roadmap.map((p, idx) => {
          const isActive   = selPhase === p.phase;
          const isLast     = idx === roadmap.length - 1;
          const { done, total, pct } = getPhaseStats(p, completed);

          const nodeComplete = pct === 100;
          const nodeInProg   = pct > 0 && pct < 100;

          // Node visual state
          const nodeBg     = nodeComplete ? successColor
                           : isActive     ? p.accent
                           : nodeInProg   ? p.accent + "22"
                           :               "var(--bg-card)";
          const nodeBorder = nodeComplete ? successColor
                           : isActive     ? p.accent
                           : nodeInProg   ? p.accent
                           :               "var(--border)";
          const nodeText   = nodeComplete ? (isDark ? "#0a1f0a" : "#fff")
                           : isActive     ? "#fff"
                           : nodeInProg   ? p.accent
                           :               "var(--text-secondary)";
          const nodeGlow   = isActive ? `0 0 14px ${p.accent}44` : "none";

          // Line color between nodes
          const lineColor = nodeComplete ? successColor : "var(--border)";

          // Stat chip
          const statColor = nodeComplete ? successColor
                          : pct > 0     ? p.light
                          :              "var(--text-muted)";
          const statLabel = nodeComplete ? "✓ Done"
                          : pct > 0     ? `${pct}%`
                          :              `${p.weeks.length}w`;

          return (
            <div key={p.phase} style={{ display: "flex", alignItems: "flex-start" }}>

              {/* ── Vertical thread column ── */}
              <div style={{ width: 48, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10 }}>

                {/* Phase number node */}
                <div
                  onClick={() => { selectPhase(p.phase); if (isMobile) setMobileView("detail"); }}
                  title={`Phase ${p.phase}: ${p.title}`}
                  style={{
                    width:        30,
                    height:       30,
                    borderRadius: "50%",
                    background:   nodeBg,
                    border:       `2px solid ${nodeBorder}`,
                    color:        nodeText,
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    fontSize:     12,
                    fontWeight:   800,
                    flexShrink:   0,
                    boxShadow:    nodeGlow,
                    cursor:       "pointer",
                    userSelect:   "none",
                    transition:   "background 0.2s, box-shadow 0.2s, border-color 0.2s",
                  }}
                >
                  {nodeComplete ? "✓" : p.phase}
                </div>

                {/* Connecting line to next node */}
                {!isLast && (
                  <div
                    style={{
                      width:        2,
                      flex:         1,
                      minHeight:    20,
                      background:   lineColor,
                      marginTop:    4,
                      marginBottom: 4,
                      borderRadius: 1,
                      transition:   "background 0.3s",
                    }}
                  />
                )}
              </div>

              {/* ── Phase info card (clickable) ── */}
              <button
                className="timeline-phase-btn"
                onClick={() => { selectPhase(p.phase); if (isMobile) setMobileView("detail"); }}
                style={{
                  flex:       1,
                  minWidth:   0,
                  marginLeft: 8,
                  marginBottom: isLast ? 0 : 4,
                  background: isActive ? p.accent + "10" : undefined,
                  border:     isActive ? `1px solid ${p.accent}44` : "1px solid transparent",
                }}
              >
                {/* Phase badge + title row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: isActive ? p.light : "var(--text-muted)", marginBottom: 2 }}>
                      Phase {p.phase}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? "var(--text-heading)" : "var(--text-secondary)", lineHeight: 1.35, transition: "color 0.15s" }}>
                      {p.title}
                    </div>
                    {/* Description — shown only when not active */}
                    {!isActive && (
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                        {p.desc}
                      </div>
                    )}
                  </div>

                  {/* Stat chip */}
                  <div style={{ fontSize: 9, fontWeight: 700, color: statColor, flexShrink: 0, marginTop: 2, letterSpacing: 0.3 }}>
                    {statLabel}
                  </div>
                </div>

                {/* Progress bar — shown when active or has progress */}
                {(isActive || pct > 0) && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 3, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                      <div
                        style={{
                          height:     "100%",
                          width:      `${pct}%`,
                          background: nodeComplete ? successColor : p.accent,
                          borderRadius: 2,
                          transition: "width 0.35s ease",
                        }}
                      />
                    </div>
                    {isActive && (
                      <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
                        {done}/{total} resources · {p.weeks.length} weeks
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
