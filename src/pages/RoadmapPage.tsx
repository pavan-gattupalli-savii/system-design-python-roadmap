// ── Roadmap page ──────────────────────────────────────────────────────────────
// Reads selPhase + selWeek from the URL so refreshes restore exactly the same
// view. Renders TimelinePanel (left) + DetailPanel (right) with a draggable
// resize handle, falling back to mobile-friendly stacked navigation.

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { TimelinePanel } from "../components/TimelinePanel";
import { DetailPanel }   from "../components/DetailPanel";
import { SearchResults } from "../components/SearchResults";
import { useRoadmap }    from "../hooks/useRoadmap";
import { usePanelResize }from "../hooks/usePanelResize";
import { getAllWeeks }   from "../utils/stats";
import type { LayoutContext } from "../components/Layout";
import type { Language } from "../data/roadmap-index";

function DragHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 4, flexShrink: 0, cursor: "col-resize",
        background: hovered ? "#6366f1" : "transparent",
        transition: "background 0.15s", zIndex: 10,
      }}
      title="Drag to resize"
    />
  );
}

export default function RoadmapPage() {
  const ctx = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const { p, w } = useParams<{ p?: string; w?: string }>();
  const [params, setParams] = useSearchParams();

  const selPhase = p ? parseInt(p) : 1;
  const selWeek  = w ? parseInt(w) : NaN;
  const lang: Language = ctx.lang;

  const roadmap   = useRoadmap(lang);
  const flatWeeks = useMemo(() => getAllWeeks(roadmap), [roadmap]);
  const totalWeeks = flatWeeks.length ? flatWeeks[flatWeeks.length - 1].n : 54;

  const phase   = roadmap.find((ph) => ph.phase === selPhase);

  // Default to first week of selected phase if none provided.
  useEffect(() => {
    if (!phase) return;
    if (Number.isNaN(selWeek)) {
      const first = phase.weeks[0]?.n;
      if (first) navigate(`/app/roadmap/phase/${phase.phase}/week/${first}`, { replace: true });
    }
  }, [phase, selWeek, navigate]);

  const weekObj = flatWeeks.find((wk) => wk.n === selWeek && wk.phase === selPhase);

  function selectPhase(ph: number) {
    const first = roadmap.find((p2) => p2.phase === ph)?.weeks[0]?.n ?? 1;
    navigate(`/app/roadmap/phase/${ph}/week/${first}`);
  }
  function selectWeek(wn: number) {
    navigate(`/app/roadmap/phase/${selPhase}/week/${wn}`);
    if (ctx.isMobile) setMobileView("detail");
  }

  // Search query lives in the URL (?q=...) so it survives refresh.
  const searchQuery = params.get("q") ?? "";
  function setSearchQuery(q: string) {
    const next = new URLSearchParams(params);
    if (q) next.set("q", q); else next.delete("q");
    setParams(next, { replace: true });
  }

  const [openSessions, setOpenSessions] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });
  const [mobileView, setMobileView] = useState<string>("phases");
  const timeline = usePanelResize(360, 240, 540);

  function toggleSession(si: number) {
    setOpenSessions((prev) => ({ ...prev, [si]: !prev[si] }));
  }

  function handleJumpToWeek(ph: number, wn: number) {
    navigate(`/app/roadmap/phase/${ph}/week/${wn}`);
    setSearchQuery("");
    setOpenSessions({ 0: true, 1: true, 2: true });
    if (ctx.isMobile) setMobileView("detail");
  }

  const showSearch = searchQuery.trim().length > 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Search bar */}
      <div style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        padding: "8px 16px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0,
      }}>
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
          <button onClick={() => setSearchQuery("")}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>
            ✕
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {showSearch ? (
          <SearchResults
            roadmap={roadmap}
            query={searchQuery}
            onJumpToWeek={handleJumpToWeek}
            isMobile={ctx.isMobile}
            completed={ctx.completed}
            toggle={ctx.toggleCompleted}
          />
        ) : ctx.isMobile ? (
          <>
            {mobileView === "phases" && (
              <TimelinePanel
                roadmap={roadmap}
                selPhase={selPhase}
                isMobile={true}
                width={0}
                completed={ctx.completed}
                isDark={ctx.isDark}
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
                isDark={ctx.isDark}
                setMobileView={setMobileView}
                selectWeek={selectWeek}
                completed={ctx.completed}
                toggle={ctx.toggleCompleted}
                totalWeeks={totalWeeks}
              />
            )}
          </>
        ) : (
          <>
            <TimelinePanel
              roadmap={roadmap}
              selPhase={selPhase}
              isMobile={false}
              width={timeline.width}
              completed={ctx.completed}
              isDark={ctx.isDark}
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
              isDark={ctx.isDark}
              setMobileView={setMobileView}
              selectWeek={selectWeek}
              completed={ctx.completed}
              toggle={ctx.toggleCompleted}
              totalWeeks={totalWeeks}
            />
          </>
        )}
      </div>
    </div>
  );
}
