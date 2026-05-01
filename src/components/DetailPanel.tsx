import { useMemo } from "react";
import { TYPES } from "../data/types";
import { resId, sessionColors } from "../utils/stats";
import { ResourceCard } from "./ResourceCard";
import type { Phase, WeekWithPhase } from "../data/models";
import type { Language } from "../data/roadmap-index";
import { useBuilds } from "../hooks/useBuilds";
import { useAuth } from "../lib/auth";

interface Props {
  weekObj:       WeekWithPhase | undefined;
  phase:         Phase | undefined;
  openSessions:  Record<number, boolean>;
  toggleSession: (si: number) => void;
  isMobile:      boolean;
  isDark:        boolean;
  setMobileView: (v: string) => void;
  selectWeek:    (wn: number) => void;
  completed:     Set<string>;
  toggle:        (id: string) => void;
  totalWeeks:    number;
  language:      Language;
}

export function DetailPanel({
  weekObj, phase, openSessions, toggleSession,
  isMobile, isDark, setMobileView, selectWeek,
  completed, toggle, totalWeeks, language,
}: Props) {
  const { user } = useAuth();
  const { submissions: buildSubmissions, submit: submitBuild, remove: deleteBuild } = useBuilds(language);

  // MUST be called unconditionally (Rules of Hooks) — guard inside the memo body
  const weekProgress = useMemo(() => {
    if (!phase) return {} as Record<number, { done: number; total: number }>;
    const map: Record<number, { done: number; total: number }> = {};
    phase.weeks.forEach((w) => {
      let done = 0, total = 0;
      w.sessions.forEach((s, si) => {
        s.resources.forEach((_, ri) => {
          total++;
          if (completed.has(resId(phase.phase, w.n, si, ri))) done++;
        });
      });
      map[w.n] = { done, total };
    });
    return map;
  }, [phase, completed]);

  const successColor = isDark ? "#4ade80" : "#16a34a";

  if (!phase) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        ← Select a phase to begin
      </div>
    );
  }

  if (!weekObj) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
        ← Select a week to see resources
      </div>
    );
  }

  const allMins = weekObj.sessions.reduce((a, s) => a + s.resources.reduce((b, r) => b + r.mins, 0), 0);

  const typeCounts: Record<string, number> = {};
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
  const phaseAccent = phase.accent || "#6366f1";

  // Per-week progress is already computed above (weekProgress)
  const weekIndex = phase.weeks.findIndex((w) => w.n === weekObj.n);
  const prevWeekN  = weekIndex > 0                       ? phase.weeks[weekIndex - 1].n : null;
  const nextWeekN  = weekIndex < phase.weeks.length - 1  ? phase.weeks[weekIndex + 1].n : null;

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

      {/* ── Week selector strip ──────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", flexShrink: 0 }}>

        {/* Active week title + prev/next navigation */}
        <div
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         10,
            padding:     "8px 16px 6px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>{phase.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 1 }}>
              Phase {weekObj.phase} · Week {weekObj.n} of {phase.weeks.length}
            </div>
            <div
              style={{
                fontSize:     12,
                color:        phaseAccent,
                fontWeight:   600,
                whiteSpace:   "nowrap",
                overflow:     "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {weekObj.title}
            </div>
          </div>
          {/* Prev / Next arrow buttons */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => prevWeekN !== null && selectWeek(prevWeekN)}
              disabled={prevWeekN === null}
              title="Previous week (←)"
              style={{
                background:  "transparent",
                border:      "1px solid " + (prevWeekN !== null ? "var(--border)" : "var(--border-subtle)"),
                color:       prevWeekN !== null ? "var(--text-secondary)" : "var(--border)",
                borderRadius: 5,
                padding:     "3px 10px",
                fontSize:    14,
                cursor:      prevWeekN !== null ? "pointer" : "default",
                fontFamily:  "inherit",
                lineHeight:  1,
                transition:  "all 0.12s",
              }}
            >
              ‹
            </button>
            <button
              onClick={() => nextWeekN !== null && selectWeek(nextWeekN)}
              disabled={nextWeekN === null}
              title="Next week (→)"
              style={{
                background:  "transparent",
                border:      "1px solid " + (nextWeekN !== null ? "var(--border)" : "var(--border-subtle)"),
                color:       nextWeekN !== null ? "var(--text-secondary)" : "var(--border)",
                borderRadius: 5,
                padding:     "3px 10px",
                fontSize:    14,
                cursor:      nextWeekN !== null ? "pointer" : "default",
                fontFamily:  "inherit",
                lineHeight:  1,
                transition:  "all 0.12s",
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Week number buttons with progress dots */}
        <div
          style={{
            overflowX:  "auto",
            display:    "flex",
            alignItems: "stretch",
            gap:        8,
            padding:    "10px 16px 12px",
          }}
        >
          {phase.weeks.map((w) => {
            const prog    = weekProgress[w.n] || { done: 0, total: 0 };
            const isDone  = prog.total > 0 && prog.done === prog.total;
            const hasProg = prog.done > 0 && !isDone;
            const isActive = weekObj.n === w.n;
            const dotColor = isDone ? successColor : hasProg ? phaseAccent : "var(--border)";

            return (
              <button
                key={w.n}
                onClick={() => selectWeek(w.n)}
                title={`Week ${w.n}: ${w.title}`}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            4,
                  background:     isActive ? phaseAccent : isDone ? successColor + "18" : "transparent",
                  border:         "1px solid " + (isActive ? phaseAccent : isDone ? successColor + "55" : hasProg ? phaseAccent + "44" : "var(--border)"),
                  color:          isActive ? "#fff" : isDone ? successColor : "var(--text-secondary)",
                  borderRadius:   6,
                  padding:        "6px 14px 5px",
                  fontSize:       11,
                  fontWeight:     isActive ? 700 : 400,
                  cursor:         "pointer",
                  fontFamily:     "inherit",
                  flexShrink:     0,
                  minWidth:       40,
                  transition:     "all 0.12s",
                }}
              >
                <span style={{ lineHeight: 1 }}>
                  {isDone && !isActive ? "✓" : w.n}
                </span>
                {/* Tiny progress dot */}
                <div
                  style={{
                    width:        5,
                    height:       5,
                    borderRadius: "50%",
                    background:   isActive ? "rgba(255,255,255,0.65)" : dotColor,
                    transition:   "background 0.2s",
                    flexShrink:   0,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Week content ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 14px 80px" : "24px 28px" }}>

        {/* Mobile back button */}
        {isMobile && (
          <button className="back-btn" onClick={() => setMobileView("phases")} style={{ marginBottom: 14 }}>
            ‹ All phases
          </button>
        )}

        {/* Week header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: phaseAccent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
            Phase {weekObj.phase} · Week {weekObj.n} of {totalWeeks}
          </div>
          <h2 style={{ fontSize: isMobile ? 17 : 20, color: "var(--text-heading)", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.3 }}>
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
            <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 4 }}>≈ {allMins} min total</span>
            <span
              className={doneInWeek === totalResInWeek && totalResInWeek > 0 ? "success-text" : ""}
              style={{ fontSize: 11, color: doneInWeek === totalResInWeek && totalResInWeek > 0 ? successColor : "var(--text-dim)", marginLeft: "auto" }}
            >
              {doneInWeek}/{totalResInWeek} done
            </span>
          </div>

          {/* Week progress bar */}
          <div className="progress-bar-track" style={{ height: 3, marginTop: 10 }}>
            <div className="progress-bar-fill" style={{ width: weekPct + "%", background: weekPct === 100 ? successColor : phaseAccent }} />
          </div>
        </div>

        {/* Session accordions */}
        {weekObj.sessions.map((session, si) => {
          const isOpen      = openSessions[si] !== false;
          const lc          = sessionColors(session.label);
          const smins       = session.resources.reduce((a, r) => a + r.mins, 0);
          const sessionDone = session.resources.filter((_, ri) => completed.has(resId(weekObj.phase, weekObj.n, si, ri))).length;
          const sessionComplete = sessionDone === session.resources.length;

          return (
            <div key={si} style={{ marginBottom: 10, border: "1px solid " + (isOpen ? "var(--border-mid)" : "var(--border-subtle)"), borderRadius: 10, overflow: "hidden" }}>
              <button
                className="session-header"
                onClick={() => toggleSession(si)}
                style={{ width: "100%", textAlign: "left", padding: isMobile ? "11px 13px" : "13px 18px", background: isOpen ? "var(--bg-card)" : "var(--bg-panel)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", fontFamily: "inherit" }}
              >
                <span
                  className="session-badge"
                  style={{ fontSize: 10, color: lc.color, background: lc.bg, border: "1px solid " + lc.border, borderRadius: 4, padding: "2px 8px", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}
                >
                  {session.label}
                </span>
                <span style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-body)", flex: 1 }}>{session.focus}</span>
                <span
                  className={sessionComplete ? "session-done-count" : ""}
                  style={{ fontSize: 11, color: sessionComplete ? successColor : "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }}
                >
                  {sessionDone}/{session.resources.length} · {smins}m {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: isMobile ? "6px 10px 12px" : "4px 18px 16px", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", gap: 8 }}>
                  {session.resources.map((res, ri) => (
                    <ResourceCard
                      key={ri}
                      phase={weekObj.phase} weekN={weekObj.n} si={si} ri={ri}
                      res={res} completed={completed} toggle={toggle} isMobile={isMobile}
                      language={user ? language : undefined}
                      buildSubmissions={buildSubmissions}
                      onSubmitBuild={(resourceKey, githubUrl, notes) => submitBuild({ resourceKey, githubUrl, notes })}
                      onDeleteBuild={(resourceKey) => deleteBuild({ resourceKey })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Motivational tip */}
        <div style={{ marginTop: 16, background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
          <span style={{ color: "#fbbf24" }}>💡 </span>
          Build every week — even a small project cements concepts far better than passive reading. Check off resources as you complete them!
        </div>
      </div>
    </div>
  );
}
