import { useState, useMemo } from "react";
import { TYPES } from "../data/types";
import { getPhaseStats } from "../utils/stats";
import { TRACKER_URL } from "../constants/app";
import type { Phase, Channel } from "../data/models";

interface Props {
  roadmap: Phase[];
  channels: Channel[];
  completed: Set<string>;
  reset: () => void;
  isMobile: boolean;
  isDark: boolean;
  onNavigateToPhase: (ph: number) => void;
}

export function TrackerTab({ roadmap, channels, completed, reset, isMobile, isDark, onNavigateToPhase }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);
  const successColor = isDark ? "#4ade80" : "#16a34a";

  const totalStats = useMemo(() => {
    let total = 0, done = 0;
    roadmap.forEach((p) => {
      const s = getPhaseStats(p, completed);
      total += s.total;
      done  += s.done;
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [completed, roadmap]);

  const handleReset = () => {
    if (confirmReset) { reset(); setConfirmReset(false); }
    else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "24px 32px" }}>

      {/* ── Overall progress ── */}
      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)" }}>Overall Progress</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              {totalStats.done} of {totalStats.total} resources completed ·{" "}
              <span style={{ color: totalStats.pct === 100 ? successColor : "#6366f1", fontWeight: 700 }}>{totalStats.pct}%</span>
            </div>
          </div>
          <button className={"reset-btn" + (confirmReset ? " confirm" : "")} onClick={handleReset}>
            {confirmReset ? "⚠ Confirm reset" : "Reset progress"}
          </button>
        </div>
        <div className="progress-bar-track" style={{ height: 8 }}>
          <div className="progress-bar-fill" style={{ width: totalStats.pct + "%", background: totalStats.pct === 100 ? "#4ade80" : "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
        </div>
      </div>

      {/* ── Google Sheets tracker link ── */}
      <div style={{ marginBottom: 20 }}>
        <a href={TRACKER_URL} target="_blank" rel="noopener noreferrer" className="tracker-link" style={{ fontSize: 13, padding: "9px 18px" }}>
          📊 Open Google Sheets Tracker ↗
        </a>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
          Your personal spreadsheet tracker — weekly goals, session logs, and resource library.
        </div>
      </div>

      {/* ── Progress by phase ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
        Progress by Phase — <span style={{ fontWeight: 400, letterSpacing: 0 }}>click a phase to open its roadmap</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 24 }}>
        {roadmap.map((p) => {
          const { done, total, pct } = getPhaseStats(p, completed);
          return (
            <button
              key={p.phase}
              onClick={() => onNavigateToPhase(p.phase)}
              style={{
                textAlign:    "left",
                background:   "var(--bg-panel)",
                border:       "1px solid " + (pct === 100 ? successColor + "55" : pct > 0 ? p.accent + "44" : "var(--border)"),
                borderRadius: 10,
                padding:      "14px 16px",
                cursor:       "pointer",
                fontFamily:   "inherit",
                transition:   "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor  = p.accent;
                e.currentTarget.style.background   = p.accent + "08";
                e.currentTarget.style.transform    = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor  = pct === 100 ? successColor + "55" : pct > 0 ? p.accent + "44" : "var(--border)";
                e.currentTarget.style.background   = "var(--bg-panel)";
                e.currentTarget.style.transform    = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? successColor : p.light }}>Phase {p.phase}: {p.title}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{p.weeks.length} weeks · {done}/{total} resources</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? successColor : pct > 50 ? p.light : "var(--text-muted)", flexShrink: 0 }}>{pct}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: pct + "%", background: pct === 100 ? successColor : p.accent }} />
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textAlign: "right" }}>Open Roadmap →</div>
            </button>
          );
        })}
      </div>

      {/* ── Resource type legend ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Resource Types</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {Object.entries(TYPES).map(([name, tc]) => (
          <span key={name} style={{ fontSize: 11, color: tc.tx, background: tc.bg, border: "1px solid " + tc.tx + "25", borderRadius: 6, padding: "4px 10px" }}>
            {tc.icon} {name}
          </span>
        ))}
      </div>

      {/* ── Key channels (from constants/channels.js) ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Key Channels & References</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
        {channels.map((ch) => (
          <a
            key={ch.name}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--text-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-bright)", marginBottom: 3 }}>{ch.name} ↗</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{ch.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
