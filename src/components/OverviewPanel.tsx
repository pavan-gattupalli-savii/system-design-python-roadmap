import { useMemo } from "react";
import { getPhaseStats } from "../utils/stats";
import type { Phase } from "../data/models";

interface Props {
  roadmap: Phase[];
  selPhase: number;
  isMobile: boolean;
  completed: Set<string>;
  isDark: boolean;
  onSelectPhase: (ph: number) => void;
  lang: string;
}

export function OverviewPanel({ roadmap, selPhase, isMobile, completed, isDark, onSelectPhase, lang }: Props) {
  const successColor = isDark ? "#4ade80" : "#16a34a";
  const totalStats = useMemo(() => {
    let total = 0, done = 0;
    roadmap.forEach((p) => { const s = getPhaseStats(p, completed); total += s.total; done += s.done; });
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [completed, roadmap]);

  const totalWeeks = roadmap.reduce((s, p) => s + p.weeks.length, 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : "28px 32px" }}>

      {/* ── Hero summary bar ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-card) 100%)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: isMobile ? "16px 18px" : "20px 28px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 16 : 28,
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: "var(--text-heading)", marginBottom: 4 }}>
            {lang === "python" ? "🐍" : "☕"} {lang === "python" ? "Python" : "Java"} System Design Roadmap
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
            {roadmap.length} phases · {totalWeeks} weeks · structured, resource-backed learning
          </div>
        </div>

        {/* Overall progress ring area */}
        <div style={{ display: "flex", gap: isMobile ? 16 : 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: totalStats.pct > 0 ? "#a5b4fc" : "var(--border-mid)", lineHeight: 1 }}>
              {totalStats.pct}%
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>complete</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "var(--text-bright)", lineHeight: 1 }}>
              {totalStats.done}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>/{totalStats.total} done</div>
          </div>
          {/* overall bar */}
          <div style={{ width: isMobile ? "100%" : 160 }}>
            <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: totalStats.pct + "%", background: totalStats.pct === 100 ? successColor : "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
              {totalStats.done === 0 ? "Start by clicking any phase below" : `${totalStats.total - totalStats.done} resources remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section label ── */}
      <div style={{ fontSize: 10, letterSpacing: 2, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12, paddingLeft: 2 }}>
        Phases — click to begin
      </div>

      {/* ── Phase cards grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 12,
      }}>
        {roadmap.map((p) => {
          const { done, total, pct } = getPhaseStats(p, completed);
          const isActive = selPhase === p.phase;

          return (
            <button
              key={p.phase}
              onClick={() => onSelectPhase(p.phase)}
              style={{
                textAlign: "left",
                background: isActive ? p.accent + "12" : "var(--bg-panel)",
                border: "1px solid " + (isActive ? p.accent + "66" : "var(--border)"),
                borderRadius: 12,
                padding: "16px 18px",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s, transform 0.1s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isActive ? p.accent + "88" : "#2d3748";
                e.currentTarget.style.background = isActive ? p.accent + "18" : "var(--bg-card)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isActive ? p.accent + "66" : "var(--border)";
                e.currentTarget.style.background = isActive ? p.accent + "12" : "var(--bg-panel)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Accent top strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: isActive ? p.accent : pct > 0 ? p.accent + "44" : "transparent", borderRadius: "12px 12px 0 0" }} />

              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, filter: isActive ? "none" : "grayscale(40%)" }}>{p.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: isActive ? p.light : "var(--text-muted)" }}>
                      Phase {p.phase}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--border-mid)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px" }}>
                      {p.weeks.length} wks
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "var(--text-heading)" : "#94a3b8", lineHeight: 1.3 }}>
                    {p.title}
                  </div>
                </div>
                {/* Progress badge */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: pct === 100 ? successColor : pct > 0 ? p.light : "var(--border-mid)" }}>
                    {pct === 100 ? "✓" : pct > 0 ? pct + "%" : p.phase}
                  </span>
                </div>
              </div>

              {/* Description */}
              {p.desc && (
                <div style={{ fontSize: 11, color: isActive ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: 1.5, marginBottom: 10, minHeight: 30 }}>
                  {p.desc.length > 90 ? p.desc.slice(0, 90) + "…" : p.desc}
                </div>
              )}

              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? successColor : p.accent, borderRadius: 2, transition: "width 0.4s ease" }} />
              </div>

              {/* Footer row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{done}/{total} resources</span>
                <span style={{ fontSize: 10, color: isActive ? p.light : "var(--text-muted)", fontWeight: isActive ? 700 : 400 }}>
                  {isActive ? "▶ Open →" : "Click to start →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
