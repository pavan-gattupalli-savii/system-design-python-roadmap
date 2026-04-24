import { getPhaseStats } from "../utils/stats";
import type { Phase } from "../data/models";

interface Props {
  roadmap: Phase[];
  selPhase: number;
  isMobile: boolean;
  width: number;
  selectPhase: (ph: number) => void;
  completed: Set<string>;
}

export function PhasesPanel({ roadmap, selPhase, isMobile, width, selectPhase, completed }: Props) {
  return (
    <div
      style={{
        background: "#0d1117",
        overflowY: "auto",
        flexShrink: 0,
        width: isMobile ? "100%" : width,
        borderRight: isMobile ? "none" : "1px solid #1c2430",
      }}
    >
      {roadmap.map((p: Phase) => {
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
              borderLeft: !isMobile ? (isActive ? "3px solid " + p.accent : "3px solid transparent") : "none",
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
                    <div className="progress-bar-fill" style={{ width: pct + "%", background: pct === 100 ? "#4ade80" : p.accent }} />
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
