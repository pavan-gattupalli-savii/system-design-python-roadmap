import { resId } from "../utils/stats";
import { PANEL_WIDTH } from "../constants/theme";

export function WeeksPanel({ phase, selWeek, isMobile, selectWeek, setMobileView, completed }) {
  return (
    <div
      style={{
        background: "#090e16",
        overflowY: "auto",
        flexShrink: 0,
        width: isMobile ? "100%" : PANEL_WIDTH.weeks,
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
              borderBottom: "1px solid #0d1117",
              padding: isMobile ? "13px 16px" : "9px 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: isMobile ? "center" : "flex-start",
              flexDirection: isMobile ? "row" : "column",
              gap: isMobile ? 12 : 2,
            }}
          >
            <span style={{ fontSize: 11, color: wComplete ? "#4ade80" : isActive ? phase.light : "#4b5563", letterSpacing: 1, textTransform: "uppercase", flexShrink: 0, fontWeight: wComplete ? 700 : 400 }}>
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
