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
}

export function TrackerTab({ roadmap, channels, completed, reset, isMobile }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

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

      {/* ── Session notice ── */}
      <div style={{ background: "#0f1a0f", border: "1px solid #1a4d2e", borderRadius: 8, padding: "9px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
        <span style={{ fontSize: 11, color: "#6ee7b7", lineHeight: 1.5 }}>
          Progress is tracked for this browser session only and resets on refresh. This keeps each visitor's view independent.{" "}
          <span style={{ color: "#374151" }}>User accounts coming in a future update.</span>
        </span>
      </div>

      {/* ── Overall progress ── */}
      <div style={{ background: "#0d1117", border: "1px solid #1c2430", borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Overall Progress</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {totalStats.done} of {totalStats.total} resources completed ·{" "}
              <span style={{ color: totalStats.pct === 100 ? "#4ade80" : "#6366f1", fontWeight: 700 }}>{totalStats.pct}%</span>
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
        <div style={{ marginTop: 8, fontSize: 11, color: "#374151" }}>
          Your personal spreadsheet tracker — weekly goals, session logs, and resource library.
        </div>
      </div>

      {/* ── Progress by phase ── */}
      <div style={{ fontSize: 11, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
        Progress by Phase
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginBottom: 24 }}>
        {roadmap.map((p) => {
          const { done, total, pct } = getPhaseStats(p, completed);
          return (
            <div key={p.phase} style={{ background: "#0d1117", border: "1px solid " + (pct === 100 ? "#1a4d2e" : "#1c2430"), borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? "#4ade80" : p.light }}>Phase {p.phase}: {p.title}</div>
                  <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{p.weeks.length} weeks · {done}/{total} resources</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? "#4ade80" : pct > 50 ? p.light : "#374151", flexShrink: 0 }}>{pct}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: pct + "%", background: pct === 100 ? "#4ade80" : p.accent }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Resource type legend ── */}
      <div style={{ fontSize: 11, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Resource Types</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {Object.entries(TYPES).map(([name, tc]) => (
          <span key={name} style={{ fontSize: 11, color: tc.tx, background: tc.bg, border: "1px solid " + tc.tx + "25", borderRadius: 6, padding: "4px 10px" }}>
            {tc.icon} {name}
          </span>
        ))}
      </div>

      {/* ── Key channels (from constants/channels.js) ── */}
      <div style={{ fontSize: 11, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Key Channels & References</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
        {channels.map((ch) => (
          <a
            key={ch.name}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", background: "#090e16", border: "1px solid #1c2430", borderRadius: 8, padding: "11px 14px", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#374151")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1c2430")}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 3 }}>{ch.name} ↗</div>
            <div style={{ fontSize: 11, color: "#374151" }}>{ch.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
