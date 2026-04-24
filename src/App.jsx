import { useState, useEffect, useMemo, useCallback } from "react";
import "./App.css";
import {
  TYPES, TRACKER_URL, roadmap, allWeeks,
  resId, sessionColors, getPhaseStats, BOOK_URLS,
} from "./data/roadmap";

// ── HOOKS ─────────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [v, setV] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const h = () => setV(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

function useProgress() {
  const [completed, setCompleted] = useState(() => {
    try {
      const s = localStorage.getItem("sd_progress_v1");
      return new Set(s ? JSON.parse(s) : []);
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback((id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("sd_progress_v1", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCompleted(new Set());
    localStorage.removeItem("sd_progress_v1");
  }, []);

  return { completed, toggle, reset };
}

// ── URL RESOLUTION ───────────────────────────────────────────────────────────

// Converts raw "where" strings into clickable URLs.
function resolveUrl(where) {
  if (!where) return null;
  if (where.startsWith("http")) return where;

  // YouTube → search 'X'
  const yt = where.match(/YouTube\s*→\s*search\s*['"](.*?)['"]/i);
  if (yt) return `https://www.youtube.com/results?search_query=${encodeURIComponent(yt[1])}`;

  // realpython.com → search 'X'
  const rp = where.match(/realpython\.com\s*→\s*search\s*'([^']+)'/i);
  if (rp) return `https://realpython.com/search?q=${encodeURIComponent(rp[1])}`;

  // Search: 'X' or Search 'X' at start of string
  const gs = where.match(/^[Ss]earch:?\s+'([^']+)'/);
  if (gs) return `https://www.google.com/search?q=${encodeURIComponent(gs[1])}`;

  // Bare domain/path (e.g. docs.python.org/3/... or refactoring.guru/solid — desc)
  const dm = where.match(/^([a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s]*)?)/i);
  if (dm) return `https://${dm[1]}`;

  return null;
}

// Returns the best URL for a resource card (explicit url field → where → item → BOOK_URLS).
function getResourceUrl(res) {
  if (res.url) return res.url;
  const w = resolveUrl(res.where);
  if (w) return w;
  // YouTube items with "Search: 'X'" in the title
  if (res.type === "YouTube") {
    const m = res.item.match(/^Search:\s*'([^']+)'/i);
    if (m) return `https://www.youtube.com/results?search_query=${encodeURIComponent(m[1])}`;
  }
  // Books: look up free online version
  if (res.type === "Book") {
    for (const [key, url] of Object.entries(BOOK_URLS)) {
      if (res.item.includes(key)) return url;
    }
  }
  return null;
}

// ── RESOURCE CARD ─────────────────────────────────────────────────────────────

function ResourceCard({ phase, weekN, si, ri, res, completed, toggle, isMobile }) {
  const id = resId(phase, weekN, si, ri);
  const isDone = completed.has(id);
  const tc = TYPES[res.type] || TYPES["Article"];

  return (
    <div
      className={"resource-card" + (isDone ? " done" : "")}
      style={{
        background: tc.bg,
        border: "1px solid " + tc.tx + "22",
        borderRadius: 8,
        padding: isMobile ? "10px 12px" : "12px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span
              style={{
                fontSize: 10,
                color: tc.tx,
                background: tc.tx + "14",
                border: "1px solid " + tc.tx + "28",
                borderRadius: 4,
                padding: "2px 7px",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {tc.icon} {res.type}
            </span>
            <span style={{ fontSize: 11, color: "#475569" }}>{res.mins} min</span>
          </div>
          <div
            className="resource-title"
            style={{
              fontSize: isMobile ? 12 : 13,
              color: isDone ? "#4b5563" : "#f0f6ff",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {(() => {
              const url = getResourceUrl(res);
              return url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  onClick={(e) => e.stopPropagation()}
                >
                  {res.item}
                  <span style={{ fontSize: 10, color: tc.tx, marginLeft: 5, opacity: 0.75 }}>↗</span>
                </a>
              ) : res.item;
            })()}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 5, lineHeight: 1.4 }}>
            <span style={{ color: "#374151" }}>{"→ "}</span>
            {res.where}
          </div>
        </div>
        <button
          className="check-btn"
          onClick={(e) => { e.stopPropagation(); toggle(id); }}
          aria-label={isDone ? "Mark as not done" : "Mark as done"}
          style={{ marginTop: 2 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{isDone ? "✅" : "⬜"}</span>
        </button>
      </div>
    </div>
  );
}

// ── PHASES PANEL ──────────────────────────────────────────────────────────────

function PhasesPanel({ selPhase, isMobile, selectPhase, completed }) {
  return (
    <div
      style={{
        background: "#0d1117",
        overflowY: "auto",
        flexShrink: 0,
        width: isMobile ? "100%" : 200,
        borderRight: isMobile ? "none" : "1px solid #1c2430",
      }}
    >
      {roadmap.map((p) => {
        const { done, total, pct } = getPhaseStats(p, completed);
        const isActive = selPhase === p.phase;
        return (
          <button
            key={p.phase}
            className="btn-phase"
            onClick={() => selectPhase(p.phase)}
            style={{
              width: "100%",
              textAlign: "left",
              background: isActive ? p.accent + "16" : "transparent",
              borderLeft: !isMobile
                ? isActive ? "3px solid " + p.accent : "3px solid transparent"
                : "none",
              borderRight: "none",
              borderTop: "none",
              borderBottom: "1px solid #111827",
              padding: isMobile ? "14px 16px" : "10px 16px",
              cursor: "pointer",
              display: "flex",
              flexDirection: isMobile ? "row" : "column",
              alignItems: isMobile ? "center" : "flex-start",
              gap: isMobile ? 14 : 3,
            }}
          >
            <span style={{ fontSize: isMobile ? 24 : 20, flexShrink: 0 }}>{p.icon}</span>
            <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? p.light : "#64748b" }}>
                Phase {p.phase}
              </div>
              <div style={{ fontSize: isMobile ? 13 : 11, color: isActive ? "#e2e8f0" : "#4b5563", lineHeight: 1.35, marginTop: 2 }}>
                {p.title}
              </div>
              {!isMobile && (
                <>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: pct + "%", background: pct === 100 ? "#4ade80" : p.accent }}
                    />
                  </div>
                  <div style={{ fontSize: 9, color: "#374151", marginTop: 2 }}>
                    {done}/{total}{pct > 0 ? " · " + pct + "%" : ""}{pct === 100 ? " ✓" : ""}
                  </div>
                </>
              )}
            </div>
            {isMobile && (
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: pct === 100 ? "#4ade80" : p.light }}>{pct}%</div>
                <span style={{ color: "#334155", fontSize: 16 }}>›</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── WEEKS PANEL ───────────────────────────────────────────────────────────────

function WeeksPanel({ phase, selWeek, isMobile, selectWeek, setMobileView, completed }) {
  return (
    <div
      style={{
        background: "#090e16",
        overflowY: "auto",
        flexShrink: 0,
        width: isMobile ? "100%" : 170,
        borderRight: isMobile ? "none" : "1px solid #1c2430",
      }}
    >
      {isMobile && (
        <button className="back-btn" onClick={() => setMobileView("phases")}>
          ‹ All Phases
        </button>
      )}
      <div style={{ padding: "10px 14px 6px", fontSize: 10, letterSpacing: 2, color: "#374151", textTransform: "uppercase" }}>
        {phase && phase.icon} {phase && phase.title}
      </div>
      {phase && phase.weeks.map((w) => {
        let wTotal = 0, wDone = 0;
        w.sessions.forEach((s, si) => {
          s.resources.forEach((_, ri) => {
            wTotal++;
            if (completed.has(resId(phase.phase, w.n, si, ri))) wDone++;
          });
        });
        const wComplete = wTotal > 0 && wDone === wTotal;
        const isActive = selWeek === w.n;
        return (
          <button
            key={w.n}
            className="btn-week"
            onClick={() => selectWeek(w.n)}
            style={{
              width: "100%",
              textAlign: "left",
              background: isActive ? phase.accent + "16" : "transparent",
              borderLeft: !isMobile
                ? isActive ? "2px solid " + phase.accent : "2px solid transparent"
                : "none",
              borderRight: "none",
              borderTop: "none",
              borderBottom: "1px solid #0d1117",
              padding: isMobile ? "13px 16px" : "9px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: isMobile ? "center" : "flex-start",
              flexDirection: isMobile ? "row" : "column",
              gap: isMobile ? 12 : 2,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: wComplete ? "#4ade80" : isActive ? phase.light : "#4b5563",
                letterSpacing: 1,
                textTransform: "uppercase",
                flexShrink: 0,
                fontWeight: wComplete ? 700 : 400,
              }}
            >
              {wComplete ? "✓ " : ""}Wk {w.n}
            </span>
            <span style={{ fontSize: isMobile ? 13 : 11, color: isActive ? "#e2e8f0" : "#6b7280", lineHeight: 1.4, flex: 1 }}>
              {w.title}
            </span>
            {isMobile && <span style={{ color: "#334155", fontSize: 16, flexShrink: 0 }}>›</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── DETAIL PANEL ──────────────────────────────────────────────────────────────

function DetailPanel({ weekObj, phase, openSessions, toggleSession, isMobile, setMobileView, completed, toggle }) {
  if (!weekObj) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", fontSize: 13 }}>
        ← Select a week to see resources
      </div>
    );
  }

  const allMins = weekObj.sessions.reduce((a, s) => a + s.resources.reduce((b, r) => b + r.mins, 0), 0);
  const typeCounts = {};
  weekObj.sessions.forEach((s) => s.resources.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; }));
  const typeSummary = Object.entries(typeCounts).slice(0, 4);
  const totalResInWeek = weekObj.sessions.reduce((a, s) => a + s.resources.length, 0);
  const doneInWeek = weekObj.sessions.reduce(
    (a, s, si) => a + s.resources.filter((_, ri) => completed.has(resId(weekObj.phase, weekObj.n, si, ri))).length, 0
  );
  const weekPct = totalResInWeek ? Math.round((doneInWeek / totalResInWeek) * 100) : 0;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px 14px 80px" : "24px 28px" }}>
      {isMobile && (
        <button className="back-btn" onClick={() => setMobileView("weeks")} style={{ marginBottom: 14 }}>
          ‹ {phase && phase.icon} Phase {weekObj.phase} weeks
        </button>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: (phase && phase.accent) || "#6366f1", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          Phase {weekObj.phase} · Week {weekObj.n} of 40
        </div>
        <h2 style={{ fontSize: isMobile ? 17 : 20, color: "#f0f6ff", fontWeight: 700, margin: "0 0 12px", lineHeight: 1.3 }}>
          {weekObj.title}
        </h2>
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
        <div className="progress-bar-track" style={{ height: 3, marginTop: 10 }}>
          <div className="progress-bar-fill" style={{ width: weekPct + "%", background: weekPct === 100 ? "#4ade80" : ((phase && phase.accent) || "#6366f1") }} />
        </div>
      </div>

      {weekObj.sessions.map((session, si) => {
        const isOpen = openSessions[si] !== false;
        const lc = sessionColors(session.label);
        const smins = session.resources.reduce((a, r) => a + r.mins, 0);
        const sessionDone = session.resources.filter((_, ri) => completed.has(resId(weekObj.phase, weekObj.n, si, ri))).length;

        return (
          <div key={si} style={{ marginBottom: 10, border: "1px solid " + (isOpen ? "#21262d" : "#161b22"), borderRadius: 10, overflow: "hidden" }}>
            <button
              className="session-header"
              onClick={() => toggleSession(si)}
              style={{
                width: "100%", textAlign: "left",
                padding: isMobile ? "11px 13px" : "13px 18px",
                background: isOpen ? "#111827" : "#0d1117",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap",
                fontFamily: "inherit",
              }}
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
                  <ResourceCard key={ri} phase={weekObj.phase} weekN={weekObj.n} si={si} ri={ri} res={res} completed={completed} toggle={toggle} isMobile={isMobile} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 16, background: "#0d1117", border: "1px solid #1c2430", borderRadius: 8, padding: "12px 16px", fontSize: 11, color: "#374151", lineHeight: 1.6 }}>
        <span style={{ color: "#fbbf24" }}>💡 </span>
        Build every week — even a small project cements concepts far better than passive reading. Check off resources as you complete them!
      </div>
    </div>
  );
}

// ── SEARCH RESULTS ────────────────────────────────────────────────────────────

function SearchResults({ query, onJumpToWeek, isMobile, completed, toggle }) {
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const found = [];
    roadmap.forEach((p) => {
      p.weeks.forEach((w) => {
        w.sessions.forEach((s, si) => {
          const sessionHit = s.focus.toLowerCase().includes(q) || w.title.toLowerCase().includes(q);
          s.resources.forEach((r, ri) => {
            if (sessionHit || r.item.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.where.toLowerCase().includes(q)) {
              found.push({ p, w, s, si, r, ri });
            }
          });
        });
      });
    });
    return found;
  }, [query]);

  if (!query.trim()) return null;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "20px 28px" }}>
      <div style={{ marginBottom: 14, color: "#64748b", fontSize: 12 }}>
        <span style={{ color: results.length > 0 ? "#6ee7b7" : "#f87171" }}>
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
        {" "}for <span style={{ color: "#e2e8f0" }}>"{query}"</span>
      </div>
      {results.length === 0 ? (
        <div style={{ color: "#374151", fontSize: 13 }}>
          No matches. Try broad terms like "Redis", "Kafka", "SOLID", "auth", "docker"…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.map(({ p, w, s, si, r, ri }, i) => (
            <div key={i} style={{ background: "#0d1117", border: "1px solid #1c2430", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", background: "#090e16", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: p.accent, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
                  {p.icon} Ph{p.phase} · Wk {w.n}
                </span>
                <span style={{ fontSize: 11, color: "#4b5563" }}>·</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>{w.title}</span>
                <span style={{ fontSize: 11, color: "#4b5563" }}>·</span>
                <span style={{ fontSize: 11, color: sessionColors(s.label).color, fontStyle: "italic" }}>{s.focus}</span>
                <button
                  className="jump-btn"
                  onClick={() => onJumpToWeek(p.phase, w.n)}
                  style={{ background: p.accent + "20", border: "1px solid " + p.accent + "40", color: p.light }}
                >
                  Go to week →
                </button>
              </div>
              <div style={{ padding: "8px 14px 12px" }}>
                <ResourceCard phase={p.phase} weekN={w.n} si={si} ri={ri} res={r} completed={completed} toggle={toggle} isMobile={isMobile} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TRACKER TAB ───────────────────────────────────────────────────────────────

function TrackerTab({ completed, reset, isMobile }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const totalStats = useMemo(() => {
    let total = 0, done = 0;
    roadmap.forEach((p) => { const s = getPhaseStats(p, completed); total += s.total; done += s.done; });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [completed]);

  const handleReset = () => {
    if (confirmReset) { reset(); setConfirmReset(false); }
    else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "14px" : "24px 32px" }}>
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

      <div style={{ marginBottom: 20 }}>
        <a href={TRACKER_URL} target="_blank" rel="noopener noreferrer" className="tracker-link" style={{ fontSize: 13, padding: "9px 18px" }}>
          📊 Open Google Sheets Tracker ↗
        </a>
        <div style={{ marginTop: 8, fontSize: 11, color: "#374151" }}>
          Your personal spreadsheet tracker — weekly goals, session logs, and resource library.
        </div>
      </div>

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

      <div style={{ fontSize: 11, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Resource Types</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {Object.entries(TYPES).map(([name, tc]) => (
          <span key={name} style={{ fontSize: 11, color: tc.tx, background: tc.bg, border: "1px solid " + tc.tx + "25", borderRadius: 6, padding: "4px 10px" }}>
            {tc.icon} {name}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Key Channels & References</div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
        {[
          { name: "ByteByteGo", url: "https://youtube.com/@ByteByteGo", desc: "Visual system design walkthroughs" },
          { name: "Hussein Nasser", url: "https://youtube.com/@hnasr", desc: "Deep dives on networking & databases" },
          { name: "Gaurav Sen", url: "https://youtube.com/@gkcs", desc: "System design interview prep" },
          { name: "ArjanCodes", url: "https://youtube.com/@ArjanCodes", desc: "Python design patterns & best practices" },
          { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", desc: "GitHub reference — bookmark this" },
          { name: "refactoring.guru", url: "https://refactoring.guru", desc: "Design patterns with Python examples" },
          { name: "Use The Index, Luke", url: "https://use-the-index-luke.com", desc: "SQL indexing deep dive — free" },
          { name: "Google SRE Book", url: "https://sre.google/sre-book/table-of-contents/", desc: "Reliability engineering by Google — free" },
        ].map((ch) => (
          <a key={ch.name} href={ch.url} target="_blank" rel="noopener noreferrer"
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

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const isMobile = useIsMobile();
  const { completed, toggle, reset } = useProgress();
  const [activeTab, setActiveTab] = useState("roadmap");
  const [selPhase, setSelPhase] = useState(1);
  const [selWeek, setSelWeek] = useState(1);
  const [openSessions, setOpenSessions] = useState({ 0: true, 1: true, 2: true });
  const [mobileView, setMobileView] = useState("phases");
  const [searchQuery, setSearchQuery] = useState("");

  const phase = roadmap.find((p) => p.phase === selPhase);
  const weekObj = allWeeks.find((w) => w.n === selWeek && w.phase === selPhase);

  const selectPhase = (ph) => {
    setSelPhase(ph);
    const firstWeek = roadmap.find((p) => p.phase === ph)?.weeks[0]?.n;
    if (firstWeek) setSelWeek(firstWeek);
    setOpenSessions({ 0: true, 1: true, 2: true });
    if (isMobile) setMobileView("weeks");
  };

  const selectWeek = (wn) => {
    setSelWeek(wn);
    setOpenSessions({ 0: true, 1: true, 2: true });
    if (isMobile) setMobileView("detail");
  };

  const toggleSession = (si) => setOpenSessions((prev) => ({ ...prev, [si]: !prev[si] }));

  const handleJumpToWeek = (ph, wn) => {
    setSelPhase(ph);
    setSelWeek(wn);
    setOpenSessions({ 0: true, 1: true, 2: true });
    setSearchQuery("");
    setActiveTab("roadmap");
    if (isMobile) setMobileView("detail");
  };

  const totalStats = useMemo(() => {
    let total = 0, done = 0;
    roadmap.forEach((p) => { const s = getPhaseStats(p, completed); total += s.total; done += s.done; });
    return { total, done };
  }, [completed]);

  const showSearch = activeTab === "roadmap" && searchQuery.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060a10", color: "#c9d8e8", fontFamily: "\'Inter\', \'SF Pro Display\', system-ui, sans-serif", overflow: "hidden" }}>

      {/* TOP BAR */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1c2430", padding: isMobile ? "10px 14px 0" : "12px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, marginBottom: isMobile ? 8 : 0, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: "#f0f6ff", letterSpacing: -0.3 }}>
              🐍 System Design Roadmap
            </div>
            <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>Python-first · 40 weeks · 7 phases</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 6, padding: "5px 11px", fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: totalStats.done > 0 ? "#6366f1" : "#374151", fontWeight: 700 }}>{totalStats.done}</span>
              <span>/{totalStats.total} done</span>
            </div>
            <a href={TRACKER_URL} target="_blank" rel="noopener noreferrer" className="tracker-link">
              📊 Tracker ↗
            </a>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, marginTop: isMobile ? 4 : 10 }}>
          {[{ id: "roadmap", label: "📚 Roadmap" }, { id: "tracker", label: "📊 Overview" }].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
              style={{
                background: "transparent", border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #6366f1" : "2px solid transparent",
                padding: isMobile ? "8px 14px" : "10px 18px",
                fontSize: 12,
                color: activeTab === tab.id ? "#a5b4fc" : "#374151",
                cursor: "pointer", fontFamily: "inherit",
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: "color 0.12s, border-color 0.12s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH BAR */}
      {activeTab === "roadmap" && (
        <div style={{ background: "#090e16", borderBottom: "1px solid #161b22", padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: "#374151", flexShrink: 0 }}>🔍</span>
          <input
            className="search-input"
            placeholder="Search resources… e.g. Redis, Kafka, Docker, SOLID, auth"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
            style={{ flex: 1 }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ background: "transparent", border: "none", color: "#374151", cursor: "pointer", fontSize: 14, padding: "0 4px", fontFamily: "inherit", flexShrink: 0 }}>
              ✕
            </button>
          )}
        </div>
      )}

      {/* PACE BAR - desktop, no search */}
      {activeTab === "roadmap" && !showSearch && !isMobile && (
        <div style={{ background: "#090e16", borderBottom: "1px solid #161b22", padding: "6px 20px", display: "flex", gap: 20, flexShrink: 0 }}>
          {[
            { label: "Total weeks", val: "40" },
            { label: "Avg hrs/week", val: "8–12" },
            { label: "Core books", val: "DDIA · Fluent Python · Head First DP · SDI Vol 1–2" },
          ].map(({ label, val }) => (
            <div key={label} style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#374151", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* BODY */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {activeTab === "tracker" ? (
          <TrackerTab completed={completed} reset={reset} isMobile={isMobile} />
        ) : showSearch ? (
          <SearchResults query={searchQuery} onJumpToWeek={handleJumpToWeek} isMobile={isMobile} completed={completed} toggle={toggle} />
        ) : isMobile ? (
          <>
            {mobileView === "phases" && <PhasesPanel selPhase={selPhase} isMobile selectPhase={selectPhase} completed={completed} />}
            {mobileView === "weeks" && <WeeksPanel phase={phase} selWeek={selWeek} isMobile selectWeek={selectWeek} setMobileView={setMobileView} completed={completed} />}
            {mobileView === "detail" && <DetailPanel weekObj={weekObj} phase={phase} openSessions={openSessions} toggleSession={toggleSession} isMobile setMobileView={setMobileView} completed={completed} toggle={toggle} />}
          </>
        ) : (
          <>
            <PhasesPanel selPhase={selPhase} isMobile={false} selectPhase={selectPhase} completed={completed} />
            <WeeksPanel phase={phase} selWeek={selWeek} isMobile={false} selectWeek={selectWeek} setMobileView={setMobileView} completed={completed} />
            <DetailPanel weekObj={weekObj} phase={phase} openSessions={openSessions} toggleSession={toggleSession} isMobile={false} setMobileView={setMobileView} completed={completed} toggle={toggle} />
          </>
        )}
      </div>
    </div>
  );
}
