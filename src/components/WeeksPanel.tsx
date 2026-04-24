import { resId } from "../utils/stats";
import type { Phase } from "../data/models";

interface Props {
  phase: Phase | undefined;
  selWeek: number;
  isMobile: boolean;
  width: number;
  selectWeek: (wn: number) => void;
  setMobileView: (v: string) => void;
  completed: Set<string>;
  onBackToOverview?: () => void;
}

export function WeeksPanel({ phase, selWeek, isMobile, width, selectWeek, setMobileView, completed, onBackToOverview }: Props) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        overflowY: "auto",
        flexShrink: 0,
        width: isMobile ? "100%" : width,
        borderRight: isMobile ? "none" : "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Back to overview (desktop) */}
      {!isMobile && onBackToOverview && (
        <button
          onClick={onBackToOverview}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "10px 14px",
            color: "var(--text-muted)",
            fontSize: 11,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ‹ All phases
        </button>
      )}

      {isMobile && (
        <button className="back-btn" onClick={() => setMobileView("phases")}>
          ‹ All Phases
        </button>
      )}

      <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: 1.5, color: phase?.light ?? "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
          {phase?.icon} Phase {phase?.phase}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-bright)", marginTop: 2 }}>
          {phase?.title}
        </div>
      </div>

      {phase?.weeks.map((w) => {
        let wTotal = 0, wDone = 0;
        w.sessions.forEach((s, si) => {
          s.resources.forEach((_, ri) => {
            wTotal++;
            if (completed.has(resId(phase.phase, w.n, si, ri))) wDone++;
          });
        });
        const wComplete = wTotal > 0 && wDone === wTotal;
        const isActive  = selWeek === w.n;

        return (
          <button
            key={w.n}
            className="btn-week"
            onClick={() => selectWeek(w.n)}
            style={{
              width: "100%",
              textAlign: "left",
              background: isActive ? phase.accent + "16" : "transparent",
              borderLeft: !isMobile ? (isActive ? "2px solid " + phase.accent : "2px solid transparent") : "none",
              borderRight: "none",
              borderTop: "none",
              borderBottom: "1px solid var(--bg-panel)",
              padding: isMobile ? "13px 16px" : "9px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: isMobile ? "center" : "flex-start",
              flexDirection: isMobile ? "row" : "column",
              gap: isMobile ? 12 : 2,
            }}
          >
            <span style={{ fontSize: 11, color: wComplete ? "#4ade80" : isActive ? phase.light : "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0, fontWeight: wComplete ? 700 : 400 }}>
              {wComplete ? "✓ " : ""}Wk {w.n}
            </span>
            <span style={{ fontSize: isMobile ? 13 : 11, color: isActive ? "var(--text-bright)" : "var(--text-dim)", lineHeight: 1.4, flex: 1 }}>
              {w.title}
            </span>
            {isMobile && <span style={{ color: "#334155", fontSize: 16, flexShrink: 0 }}>›</span>}
          </button>
        );
      })}
    </div>
  );
}
