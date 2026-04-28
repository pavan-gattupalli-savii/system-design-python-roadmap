// ── Daily Topic Page ──────────────────────────────────────────────────────────
// Full-page view: today's topic expanded + 30-day history grid.

import { useNavigate, useOutletContext } from "react-router-dom";
import { useDailyTopic, useDailyHistory } from "../hooks/useDailyTopic";
import { useAuth } from "../lib/auth";
import type { LayoutContext } from "../components/Layout";

// ── Contribution graph (GitHub style) ────────────────────────────────────────

function ContributionGraph({ completed, today, isMobile }: {
  completed: Set<string>;
  today: string;
  isMobile: boolean;
}) {
  const WEEKS = isMobile ? 16 : 20;
  const CELL  = isMobile ? 12 : 14;
  const GAP   = 3;

  // Align graph start to Monday of (this week − (WEEKS − 1))
  const todayUTC   = new Date(today + "T00:00:00Z");
  const todayDow   = todayUTC.getUTCDay();                        // 0=Sun…6=Sat
  const daysToMon  = todayDow === 0 ? 6 : todayDow - 1;          // days since last Monday
  const graphStart = new Date(todayUTC);
  graphStart.setUTCDate(todayUTC.getUTCDate() - daysToMon - (WEEKS - 1) * 7);

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cells: { date: string; state: "done"|"today"|"missed"|"future" }[] = [];
  const monthLabels: { weekIdx: number; label: string }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const dt = new Date(graphStart);
      dt.setUTCDate(graphStart.getUTCDate() + w * 7 + d);
      const dateStr = dt.toISOString().slice(0, 10);
      const state =
        dateStr > today          ? "future" :
        dateStr === today        ? "today"  :
        completed.has(dateStr)   ? "done"   : "missed";
      cells.push({ date: dateStr, state });
      if (d === 0) {
        const m = dt.getUTCMonth();
        if (m !== lastMonth) {
          monthLabels.push({ weekIdx: w, label: MONTH_NAMES[m] });
          lastMonth = m;
        }
      }
    }
  }

  const DOW_LABELS = ["M", "", "W", "", "F", "", "S"];
  const DOW_WIDTH  = 16;

  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
        Contribution History
      </div>

      {/* Month labels row — aligned to column grid */}
      <div style={{ paddingLeft: DOW_WIDTH + GAP, marginBottom: 4 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${WEEKS}, ${CELL}px)`, gap: GAP }}>
          {Array.from({ length: WEEKS }, (_, w) => {
            const entry = monthLabels.find(ml => ml.weekIdx === w);
            return (
              <div key={w} style={{ fontSize: 10, color: "var(--text-muted)", height: 14, lineHeight: "14px", overflow: "visible", whiteSpace: "nowrap" }}>
                {entry?.label ?? ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-of-week labels + cell grid */}
      <div style={{ display: "flex", gap: GAP, alignItems: "flex-start" }}>
        {/* DOW labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, flexShrink: 0, width: DOW_WIDTH }}>
          {DOW_LABELS.map((label, i) => (
            <div key={i} style={{ height: CELL, lineHeight: `${CELL}px`, fontSize: 10, color: "var(--text-muted)", textAlign: "right" }}>
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid — gridAutoFlow:column fills week columns Mon→Sun */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${WEEKS}, ${CELL}px)`,
          gridTemplateRows:    `repeat(7, ${CELL}px)`,
          gap: GAP,
          gridAutoFlow: "column",
        }}>
          {cells.map(({ date, state }) => (
            <div
              key={date}
              title={date}
              style={{
                width:        CELL,
                height:       CELL,
                borderRadius: 3,
                boxSizing:    "border-box",
                background:
                  state === "done"   ? "#22c55e" :
                  state === "today"  ? "#6366f1" :
                  state === "future" ? "transparent" : "var(--bg-secondary)",
                border:
                  state === "today"  ? "2px solid #818cf8" :
                  state === "missed" ? "1px solid var(--border-subtle)" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        {[
          { color: "#22c55e",             label: "Completed" },
          { color: "#6366f1",             label: "Today" },
          { color: "var(--bg-secondary)", label: "Missed", border: "1px solid var(--border-subtle)" },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DailyTopicPage() {
  const ctx      = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { topic, isLoading, markAsRead, isMarking } = useDailyTopic();
  const { dates: completedDates }                   = useDailyHistory(150);

  const sourceLabel = topic?.sourceType === "session" ? "🗺 Roadmap Session" : "📖 Community Reading";
  const sourceColor = topic?.sourceType === "session" ? "#6366f1" : "#0ea5e9";
  const sourceBg    = topic?.sourceType === "session" ? "#6366f115" : "#0ea5e915";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: ctx.isMobile ? "14px" : "24px 32px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* ── Back button ── */}
        <button
          onClick={() => navigate("/app/overview")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 12, padding: "0 0 14px 0",
            fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ← Back to Overview
        </button>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ fontSize: ctx.isMobile ? 28 : 36 }}>🔥</div>
          <div>
            <div style={{ fontSize: ctx.isMobile ? 18 : 22, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3 }}>
              Topic of the Day
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              A new topic every day — read it, mark it, keep your streak alive
            </div>
          </div>
          {topic && topic.streak > 0 && (
            <div style={{
              marginLeft: "auto",
              background: "#f59e0b22", border: "1px solid #f59e0b55",
              borderRadius: 10, padding: "8px 16px", textAlign: "center",
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{topic.streak}</div>
              <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                day streak
              </div>
            </div>
          )}
        </div>

        {/* ── Today's topic card ── */}
        {isLoading ? (
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
            Loading today's topic…
          </div>
        ) : topic ? (
          <div style={{
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: 14, padding: ctx.isMobile ? "18px" : "24px 28px",
            marginBottom: 20,
          }}>
            {/* Source badge + date */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: sourceColor, background: sourceBg,
                border: `1px solid ${sourceColor}40`,
                borderRadius: 6, padding: "3px 10px",
              }}>
                {sourceLabel}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {new Date(topic.todayDate + "T00:00:00Z").toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>

            {/* Title */}
            <div style={{ fontSize: ctx.isMobile ? 16 : 20, fontWeight: 800, color: "var(--text-bright)", marginBottom: 6, lineHeight: 1.35 }}>
              {topic.title}
            </div>

            {/* Description */}
            {topic.description && (
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                {topic.description}
              </div>
            )}

            {/* Context tags */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {topic.phaseTitle && (
                <span style={{ fontSize: 11, background: "#6366f115", color: "#a5b4fc", border: "1px solid #6366f140", borderRadius: 5, padding: "3px 9px", fontWeight: 600 }}>
                  {topic.phaseTitle}
                </span>
              )}
              {topic.weekNum != null && (
                <span style={{ fontSize: 11, background: "var(--bg-secondary)", color: "var(--text-muted)", borderRadius: 5, padding: "3px 9px", border: "1px solid var(--border-subtle)" }}>
                  Week {topic.weekNum}{topic.weekTitle ? ` — ${topic.weekTitle}` : ""}
                </span>
              )}
              {topic.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 11, background: "var(--bg-secondary)", color: "var(--text-secondary)", borderRadius: 5, padding: "3px 9px", border: "1px solid var(--border-subtle)" }}>
                  {tag}
                </span>
              ))}
              {topic.mins != null && topic.mins > 0 && (
                <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
                  ⏱ ~{topic.mins} min
                </span>
              )}
            </div>

            {/* External link + action */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {topic.url && (
                <a
                  href={topic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "var(--bg-secondary)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", borderRadius: 8,
                    padding: "8px 16px", fontSize: 12, fontWeight: 600,
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                >
                  Open resource ↗
                </a>
              )}

              {topic.sourceType === "session" && topic.weekNum != null && topic.phase != null && (
                <button
                  onClick={() => navigate(`/app/roadmap/phase/${topic.phase}/week/${topic.weekNum}`)}
                  style={{
                    background: "var(--bg-secondary)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", borderRadius: 8,
                    padding: "8px 16px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}
                >
                  View in Roadmap →
                </button>
              )}

              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                {!user ? (
                  <button
                    onClick={() => navigate("/sign-in")}
                    style={{
                      background: "#6366f1", border: "none", color: "#fff",
                      borderRadius: 8, padding: "9px 18px", fontSize: 13,
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Sign in to track streak
                  </button>
                ) : topic.completed ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4ade80", fontWeight: 700, fontSize: 14 }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    Completed today!
                  </div>
                ) : (
                  <button
                    onClick={markAsRead}
                    disabled={isMarking}
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      border: "none", color: "#fff",
                      borderRadius: 8, padding: "9px 20px", fontSize: 13,
                      fontWeight: 600, cursor: isMarking ? "not-allowed" : "pointer",
                      fontFamily: "inherit", opacity: isMarking ? 0.7 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    {isMarking ? "Saving…" : "Mark as Read ✓"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 14, padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
            Could not load today's topic. Try again later.
          </div>
        )}

        {/* ── Streak history grid ── */}
        {user && topic && (
          <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 14, padding: ctx.isMobile ? "18px" : "22px 28px" }}>
            <ContributionGraph
              completed={completedDates}
              today={topic.todayDate}
              isMobile={ctx.isMobile}
            />
          </div>
        )}

        {/* Guest prompt for history */}
        {!user && (
          <div style={{
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "22px 28px", textAlign: "center",
            color: "var(--text-muted)", fontSize: 13,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📅</div>
            <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Track your streak</div>
            <div style={{ marginBottom: 14 }}>Sign in to see your 30-day completion history and build a streak.</div>
            <button
              onClick={() => navigate("/sign-in")}
              style={{
                background: "#6366f1", border: "none", color: "#fff",
                borderRadius: 8, padding: "8px 20px", fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Sign in
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
