import { useState, useMemo } from "react";
import "./App.css";

import { roadmap }                                      from "./data/roadmap";
import { allWeeks, getPhaseStats }                      from "./utils/stats";
import { TRACKER_URL, APP_TITLE, APP_SUBTITLE, TABS }   from "./constants/app";
import { FONT_STACK }                                    from "./constants/theme";
import { useIsMobile }                                   from "./hooks/useIsMobile";
import { useProgress }                                   from "./hooks/useProgress";
import { usePanelResize }                                from "./hooks/usePanelResize";
import { PhasesPanel }                                   from "./components/PhasesPanel";
import { WeeksPanel }                                    from "./components/WeeksPanel";
import { DetailPanel }                                   from "./components/DetailPanel";
import { SearchResults }                                 from "./components/SearchResults";
import { TrackerTab }                                    from "./components/TrackerTab";
import { AboutTab }                                      from "./components/AboutTab";

// Drag-handle divider between panels
function DragHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 4,
        flexShrink: 0,
        cursor: "col-resize",
        background: hovered ? "#6366f1" : "transparent",
        transition: "background 0.15s",
        zIndex: 10,
      }}
      title="Drag to resize"
    />
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const { completed, toggle, reset } = useProgress();

  // Resizable panel widths (desktop only)
  const phases = usePanelResize(200, 130, 300);
  const weeks  = usePanelResize(170, 110, 280);

  const [activeTab,     setActiveTab]     = useState(TABS[0].id);
  const [selPhase,      setSelPhase]      = useState(1);
  const [selWeek,       setSelWeek]       = useState(1);
  const [openSessions,  setOpenSessions]  = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });
  const [mobileView,    setMobileView]    = useState("phases");
  const [searchQuery,   setSearchQuery]   = useState("");

  const phase   = roadmap.find((p) => p.phase === selPhase);
  const weekObj = allWeeks.find((w) => w.n === selWeek && w.phase === selPhase);

  function selectPhase(ph: number) {
    setSelPhase(ph);
    const firstWeek = roadmap.find((p) => p.phase === ph)?.weeks[0]?.n;
    if (firstWeek) setSelWeek(firstWeek);
    setOpenSessions({ 0: true, 1: true, 2: true });
    if (isMobile) setMobileView("weeks");
  }

  function selectWeek(wn: number) {
    setSelWeek(wn);
    setOpenSessions({ 0: true, 1: true, 2: true });
    if (isMobile) setMobileView("detail");
  }

  function toggleSession(si: number) {
    setOpenSessions((prev) => ({ ...prev, [si]: !prev[si] }));
  }

  function handleJumpToWeek(ph: number, wn: number) {
    setSelPhase(ph);
    setSelWeek(wn);
    setOpenSessions({ 0: true, 1: true, 2: true });
    setSearchQuery("");
    setActiveTab(TABS[0].id);
    if (isMobile) setMobileView("detail");
  }

  const totalStats = useMemo(() => {
    let total = 0, done = 0;
    roadmap.forEach((p) => {
      const s = getPhaseStats(p, completed);
      total += s.total;
      done  += s.done;
    });
    return { total, done };
  }, [completed]);

  const showSearch = activeTab === "roadmap" && searchQuery.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#060a10", color: "#c9d8e8", fontFamily: FONT_STACK, overflow: "hidden" }}>

      {/* ── TOP BAR ───────────────────────────────────────────────────── */}
      <header style={{ background: "#0d1117", borderBottom: "1px solid #1c2430", padding: isMobile ? "10px 14px 0" : "12px 24px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12, marginBottom: isMobile ? 8 : 0, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: "#f0f6ff", letterSpacing: -0.3 }}>
              {APP_TITLE}
            </div>
            <div style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>{APP_SUBTITLE}</div>
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

        <nav style={{ display: "flex", marginTop: isMobile ? 4 : 10 }}>
          {TABS.map((tab) => (
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
        </nav>
      </header>

      {/* ── SEARCH BAR (roadmap tab only) ───────────────────────────────────── */}
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

      {/* ── INFO BAR (desktop · roadmap tab · no active search) ───────────────────────── */}
      {activeTab === "roadmap" && !showSearch && !isMobile && (
        <div style={{ background: "#090e16", borderBottom: "1px solid #161b22", padding: "6px 20px", display: "flex", gap: 20, flexShrink: 0 }}>
          {[
            { label: "Total weeks",  val: "40" },
            { label: "Avg hrs/week", val: "8–12" },
            { label: "Core books",   val: "DDIA · Fluent Python · Head First DP · SDI Vol 1–2" },
          ].map(({ label, val }) => (
            <div key={label} style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#374151", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              <span style={{ fontSize: 11, color: "#64748b" }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {activeTab === "tracker" ? (
          <TrackerTab completed={completed} reset={reset} isMobile={isMobile} />
        ) : activeTab === "about" ? (
          <AboutTab isMobile={isMobile} />
        ) : showSearch ? (
          <SearchResults query={searchQuery} onJumpToWeek={handleJumpToWeek} isMobile={isMobile} completed={completed} toggle={toggle} />
        ) : isMobile ? (
          <>
            {mobileView === "phases" && <PhasesPanel selPhase={selPhase} isMobile={true}  width={phases.width} selectPhase={selectPhase} completed={completed} />}
            {mobileView === "weeks"  && <WeeksPanel  phase={phase} selWeek={selWeek} isMobile={true}  width={weeks.width} selectWeek={selectWeek} setMobileView={setMobileView} completed={completed} />}
            {mobileView === "detail" && <DetailPanel weekObj={weekObj} phase={phase} openSessions={openSessions} toggleSession={toggleSession} isMobile={true}  setMobileView={setMobileView} completed={completed} toggle={toggle} />}
          </>
        ) : (
          <>
            <PhasesPanel selPhase={selPhase} isMobile={false} width={phases.width} selectPhase={selectPhase} completed={completed} />
            <DragHandle onMouseDown={phases.onDragStart} />
            <WeeksPanel  phase={phase} selWeek={selWeek} isMobile={false} width={weeks.width} selectWeek={selectWeek} setMobileView={setMobileView} completed={completed} />
            <DragHandle onMouseDown={weeks.onDragStart} />
            <DetailPanel weekObj={weekObj} phase={phase} openSessions={openSessions} toggleSession={toggleSession} isMobile={false} setMobileView={setMobileView} completed={completed} toggle={toggle} />
          </>
        )}
      </main>
    </div>
  );
}
