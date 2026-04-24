import { TYPES } from "../data/types";
import { resId, sessionColors } from "../utils/stats";
import { ResourceCard } from "./ResourceCard";
import type { Phase, WeekWithPhase } from "../data/models";

interface Props {
  weekObj: WeekWithPhase | undefined;
  phase: Phase | undefined;
  openSessions: Record<number, boolean>;
  toggleSession: (si: number) => void;
  isMobile: boolean;
  setMobileView: (v: string) => void;
  completed: Set<string>;
  toggle: (id: string) => void;
  totalWeeks: number;
}

export function DetailPanel({ weekObj, phase, openSessions, toggleSession, isMobile, setMobileView, completed, toggle, totalWeeks }: Props) {
  if (!weekObj) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", fontSize: 13 }}>
        ← Select a week to see resources
      </div>
    );
  }

  const allMins = weekObj.sessions.reduce((a, s) => a + s.resources.reduce((b, r) => b + r.mins, 0), 0);

  const typeCounts = {};
  weekObj.sessions.forEach((s) => s.resources.forEach((r) => {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
  }));
  const typeSummary = Object.entries(typeCounts).slice(0, 4);

  const totalResInWeek = weekObj.sessions.reduce((a, s) => a + s.resources.length, 0);
  const doneInWeek = weekObj.sessions.reduce(
    (a, s, si) => a + s.resources.filter((_, ri) => completed.has(resId(weekObj.phase, weekObj.n, si, ri))).length,
    0
  );
  const weekPct = totalResInWeek ? Math.round((doneInWeek / totalResInWeek) * 100) : 0;
  const phaseAccent = (phase && phase.accent) || "#6366f1";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 14px 80px" : "24px 28px" }}>

      {/* Mobile back button */}
      {isMobile && (
        <button className="back-btn" onClick={() => setMobileView("weeks")} style={{ marginBottom: 14 }}>
          ‹ {phase && phase.icon} Phase {weekObj.phase} weeks
        </button>
      )}

      {/* Week header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: phaseAccent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          Phase {weekObj.phase} · Week {weekObj.n} of {totalWeeks}
        </div>
        <h2 style={{ fontSize: isMobile ? 17 : 20, color: "#f0f6ff", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.3 }}>
          {weekObj.title}
        </h2>

        {/* Type badges + total time */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {typeSummary.map(([type, count]) => {
            const tc = TYPES[type] || TYPES["Article"];
            return (
              <span key={type} style={{ fontSize: 10, color: tc.tx, background: tc.tx + "12", border: "1px solid " + tc.tx + "25", borderRadius: 4, padding: "2px 7px" }}>
                {tc.icon} {count}× {type}
              </span>
            );
          })}
          <span style={{ fontSize: 11, color: "#475569", marginLeft: 4 }}>≈ {allMins} min total</span>
          <span style={{ fontSize: 11, color: doneInWeek === totalResInWeek && totalResInWeek > 0 ? "#4ade80" : "#6b7280", marginLeft: "auto" }}>
            {doneInWeek}/{totalResInWeek} done
          </span>
        </div>

        {/* Week progress bar */}
        <div className="progress-bar-track" style={{ height: 3, marginTop: 10 }}>
          <div className="progress-bar-fill" style={{ width: weekPct + "%", background: weekPct === 100 ? "#4ade80" : phaseAccent }} />
        </div>
      </div>

      {/* Session accordions */}
      {weekObj.sessions.map((session, si) => {
        const isOpen      = openSessions[si] !== false;
        const lc          = sessionColors(session.label);
        const smins       = session.resources.reduce((a, r) => a + r.mins, 0);
        const sessionDone = session.resources.filter((_, ri) => completed.has(resId(weekObj.phase, weekObj.n, si, ri))).length;

        return (
          <div key={si} style={{ marginBottom: 10, border: "1px solid " + (isOpen ? "#21262d" : "#161b22"), borderRadius: 10, overflow: "hidden" }}>
            <button
              className="session-header"
              onClick={() => toggleSession(si)}
              style={{ width: "100%", textAlign: "left", padding: isMobile ? "11px 13px" : "13px 18px", background: isOpen ? "#111827" : "#0d1117", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", fontFamily: "inherit" }}
            >
              <span style={{ fontSize: 10, color: lc.color, background: lc.bg, border: "1px solid " + lc.border, borderRadius: 4, padding: "2px 8px", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
                {session.label}
              </span>
              <span style={{ fontSize: isMobile ? 12 : 13, color: "#cbd5e1", flex: 1 }}>{session.focus}</span>
              <span style={{ fontSize: 11, color: sessionDone === session.resources.length ? "#4ade80" : "#374151", marginLeft: "auto", flexShrink: 0 }}>
                {sessionDone}/{session.resources.length} · {smins}m {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {isOpen && (
              <div style={{ padding: isMobile ? "6px 10px 12px" : "4px 18px 16px", background: "#090e16", display: "flex", flexDirection: "column", gap: 8 }}>
                {session.resources.map((res, ri) => (
                  <ResourceCard
                    key={ri}
                    phase={weekObj.phase} weekN={weekObj.n} si={si} ri={ri}
                    res={res} completed={completed} toggle={toggle} isMobile={isMobile}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Motivational tip */}
      <div style={{ marginTop: 16, background: "#0d1117", border: "1px solid #1c2430", borderRadius: 8, padding: "12px 16px", fontSize: 11, color: "#374151", lineHeight: 1.6 }}>
        <span style={{ color: "#fbbf24" }}>💡 </span>
        Build every week — even a small project cements concepts far better than passive reading. Check off resources as you complete them!
      </div>
    </div>
  );
}
