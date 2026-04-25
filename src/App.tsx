import { useState, useMemo, useEffect }                              from "react";
import "./App.css";

import type { Language }                                             from "./data/roadmap-index";
import { getAllWeeks, getPhaseStats }                                from "./utils/stats";
import { APP_TITLE, APP_SUBTITLE, TABS, LANGUAGES, STORAGE_KEYS, TRACKER_URL } from "./constants/app";
import { CHANNELS_BY_LANG }                                         from "./constants/channels";
import { FONT_STACK }                                               from "./constants/theme";
import { useIsMobile }                                              from "./hooks/useIsMobile";
import { useProgress }                                             from "./hooks/useProgress";
import { usePanelResize }                                           from "./hooks/usePanelResize";
import { useRoadmap }                                               from "./hooks/useRoadmap";
import { TimelinePanel }                                            from "./components/TimelinePanel";
import { DetailPanel }                                             from "./components/DetailPanel";
import { SearchResults }                                            from "./components/SearchResults";
import { TrackerTab }                                               from "./components/TrackerTab";
import { AboutTab }                                                 from "./components/AboutTab";
import { ReadingsTab }                                              from "./components/ReadingsTab";
import { InterviewTab }                                             from "./components/InterviewTab";

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

  // ── Theme ───────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => localStorage.getItem("sd-theme") !== "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("sd-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // ── Language selection ──────────────────────────────────────────────
  const [lang, setLang] = useState<Language>("python");
  const langDef       = LANGUAGES.find((l) => l.id === lang)!;
  const activeRoadmap = useRoadmap(lang);
  const channels      = CHANNELS_BY_LANG[lang];
  const storageKey    = STORAGE_KEYS[lang];
  const flatWeeks     = useMemo(() => getAllWeeks(activeRoadmap), [activeRoadmap]);
  const totalWeeks    = flatWeeks.length ? flatWeeks[flatWeeks.length - 1].n : 54;

  const { completed, toggle, reset } = useProgress(storageKey);

  // Timeline panel resize (left side)
  const timeline = usePanelResize(360, 240, 540);

  const [activeTab,     setActiveTab]     = useState(TABS[0].id);
  const [selPhase,      setSelPhase]      = useState(1);
  const [selWeek,       setSelWeek]       = useState(1);
  const [openSessions,  setOpenSessions]  = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });
  const [mobileView,    setMobileView]    = useState("phases");
  const [searchQuery,   setSearchQuery]   = useState("");

  const phase   = activeRoadmap.find((p) => p.phase === selPhase);
  const weekObj = flatWeeks.find((w) => w.n === selWeek && w.phase === selPhase);

  function switchLanguage(newLang: Language) {
    if (newLang === lang) return;
    setLang(newLang);
    setSelPhase(1);
    setSelWeek(1);
    setSearchQuery("");
    setOpenSessions({ 0: true, 1: true, 2: true });
    setMobileView("phases");
    setActiveTab(TABS[0].id);
  }

  function selectPhase(ph: number) {
    setSelPhase(ph);
    const firstWeek = activeRoadmap.find((p) => p.phase === ph)?.weeks[0]?.n;
    if (firstWeek) setSelWeek(firstWeek);
    setOpenSessions({ 0: true, 1: true, 2: true });
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
    activeRoadmap.forEach((p) => {
      const s = getPhaseStats(p, completed);
      total += s.total;
      done  += s.done;
    });
    return { total, done };
  }, [completed, activeRoadmap]);

  const showSearch = activeTab === "roadmap" && searchQuery.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--bg-page)",
        color: "var(--text-body)",
        fontFamily: FONT_STACK,
        userSelect: "none",
      }}
    >

      {/* TOP BAR */}
      <header
        style={{
          background:   "var(--bg-panel)",
          borderBottom: "1px solid var(--border)",
          boxShadow:    isDark ? "0 1px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
          padding:      isMobile ? "10px 14px 0" : "12px 24px 0",
          flexShrink:   0,
          transition:   "box-shadow 0.2s",
        }}
      >
        <div
          style={{
            display:        "flex",
            alignItems:     isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap:            12,
            marginBottom:   isMobile ? 8 : 0,
            flexWrap:       "wrap",
          }}
        >
          {/* Title */}
          <div>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3 }}>
              {APP_TITLE}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{APP_SUBTITLE}</div>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

            {/* Language switcher */}
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
              {LANGUAGES.map((l, idx) => {
                const active = lang === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => switchLanguage(l.id as Language)}
                    title={"Switch to " + l.label + " roadmap"}
                    style={{
                      background:  active ? l.accent + "22" : "transparent",
                      border:      "none",
                      borderRight: idx < LANGUAGES.length - 1 ? "1px solid var(--border)" : "none",
                      padding:     isMobile ? "6px 10px" : "6px 14px",
                      fontSize:    isMobile ? 11 : 12,
                      color:       active ? l.color : "var(--text-dim)",
                      cursor:      "pointer",
                      fontFamily:  "inherit",
                      fontWeight:  active ? 700 : 400,
                      transition:  "all 0.15s",
                      whiteSpace:  "nowrap",
                    }}
                  >
                    {l.icon} {l.label}
                  </button>
                );
              })}
            </div>

            {/* Progress pill */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", borderRadius: 6, padding: "5px 11px", fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ color: totalStats.done > 0 ? langDef.color : "var(--text-muted)", fontWeight: 700 }}>
                {totalStats.done}
              </span>
              <span>/{totalStats.total} done</span>
            </div>

            {/* Tracker link */}
            <a href={TRACKER_URL} target="_blank" rel="noopener noreferrer" className="tracker-link">
              🔊 Tracker ↗
            </a>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={() => setIsDark((d) => !d)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: "flex", marginTop: isMobile ? 4 : 10 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="nav-tab"
              onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
              style={{
                borderBottom: activeTab === tab.id ? "2px solid #6366f1" : "2px solid transparent",
                padding:      isMobile ? "8px 14px" : "10px 18px",
                fontSize:     12,
                color:        activeTab === tab.id ? "#a5b4fc" : "var(--text-muted)",
                fontWeight:   activeTab === tab.id ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* SEARCH BAR */}
      {activeTab === "roadmap" && (
        <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)", padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>🔍</span>
          <input
            className="search-input"
            placeholder="Search resources… e.g. Redis, Kafka, Docker, SOLID, auth"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearchQuery("")}
            style={{ flex: 1 }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "0 4px", fontFamily: "inherit", flexShrink: 0 }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* INFO BAR (desktop) */}
      {activeTab === "roadmap" && !showSearch && !isMobile && (
        <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)", padding: "6px 20px", display: "flex", gap: 20, flexShrink: 0 }}>
          {[
            { label: "Total weeks",  val: String(activeRoadmap.reduce((s, p) => s + p.weeks.length, 0)) },
            { label: "Avg hrs/week", val: langDef.info.hrsPerWeek },
            { label: "Core books",   val: langDef.info.books },
          ].map(({ label, val }) => (
            <div key={label} style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {activeTab === "tracker" ? (
          <TrackerTab
            roadmap={activeRoadmap}
            channels={channels}
            completed={completed}
            reset={reset}
            isMobile={isMobile}
            isDark={isDark}
            onNavigateToPhase={(ph) => { selectPhase(ph); setActiveTab("roadmap"); }}
          />
        ) : activeTab === "about" ? (
          <AboutTab isMobile={isMobile} />
        ) : activeTab === "readings" ? (
          <ReadingsTab isMobile={isMobile} />
        ) : activeTab === "interview" ? (
          <InterviewTab isMobile={isMobile} />
        ) : showSearch ? (
          <SearchResults roadmap={activeRoadmap} query={searchQuery} onJumpToWeek={handleJumpToWeek} isMobile={isMobile} completed={completed} toggle={toggle} />
        ) : isMobile ? (
          <>
            {mobileView === "phases" && (
              <TimelinePanel
                roadmap={activeRoadmap}
                selPhase={selPhase}
                isMobile={true}
                width={0}
                completed={completed}
                isDark={isDark}
                selectPhase={selectPhase}
                setMobileView={setMobileView}
              />
            )}
            {mobileView === "detail" && (
              <DetailPanel
                weekObj={weekObj}
                phase={phase}
                openSessions={openSessions}
                toggleSession={toggleSession}
                isMobile={true}
                isDark={isDark}
                setMobileView={setMobileView}
                selectWeek={selectWeek}
                completed={completed}
                toggle={toggle}
                totalWeeks={totalWeeks}
              />
            )}
          </>
        ) : (
          <>
            <TimelinePanel
              roadmap={activeRoadmap}
              selPhase={selPhase}
              isMobile={false}
              width={timeline.width}
              completed={completed}
              isDark={isDark}
              selectPhase={selectPhase}
              setMobileView={setMobileView}
            />
            <DragHandle onMouseDown={timeline.onDragStart} />
            <DetailPanel
              weekObj={weekObj}
              phase={phase}
              openSessions={openSessions}
              toggleSession={toggleSession}
              isMobile={false}
              isDark={isDark}
              setMobileView={setMobileView}
              selectWeek={selectWeek}
              completed={completed}
              toggle={toggle}
              totalWeeks={totalWeeks}
            />
          </>
        )}
      </main>
    </div>
  );
}
