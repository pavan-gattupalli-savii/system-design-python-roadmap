// ── DailyTopicCard ─────────────────────────────────────────────────────────────
// Compact card shown at the top of the Overview tab.
// Shows today's topic, a "Mark as Read" button, and the current streak.

import { useNavigate } from "react-router-dom";
import { useDailyTopic } from "../hooks/useDailyTopic";
import { useAuth } from "../lib/auth";

export function DailyTopicCard({ isMobile }: { isMobile: boolean }) {
  const { topic, isLoading, markAsRead, isMarking } = useDailyTopic();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontSize: 22 }}>🔥</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading today's topic…</div>
      </div>
    );
  }

  if (!topic) return null;

  const sourceLabel = topic.sourceType === "session" ? "🗺 Roadmap Session" : "📖 Community Reading";
  const sourceColor = topic.sourceType === "session" ? "#6366f1" : "#0ea5e9";
  const sourceBg    = topic.sourceType === "session" ? "#6366f115" : "#0ea5e915";

  return (
    <div
      style={{
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: 12, padding: isMobile ? "14px 16px" : "18px 22px",
        marginBottom: 16, cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onClick={() => navigate("/app/daily")}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Flame icon + streak */}
          <div style={{ fontSize: isMobile ? 22 : 26 }}>🔥</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 2 }}>
              Topic of the Day
            </div>
            {topic.streak > 0 && (
              <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>
                {topic.streak} day streak
              </div>
            )}
          </div>
        </div>

        {/* Source badge */}
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          color: sourceColor, background: sourceBg,
          border: `1px solid ${sourceColor}40`,
          borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {sourceLabel}
        </div>
      </div>

      {/* Topic content */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          fontSize: isMobile ? 14 : 15, fontWeight: 700,
          color: "var(--text-bright)", marginBottom: 4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {topic.title}
        </div>
        {topic.description && (
          <div style={{
            fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {topic.description}
          </div>
        )}
      </div>

      {/* Footer row — meta + action */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        {/* Tags / context */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {topic.phaseTitle && (
            <span style={{
              fontSize: 10, background: "#6366f115",
              color: "#a5b4fc", border: "1px solid #6366f140",
              borderRadius: 5, padding: "2px 7px", fontWeight: 600,
            }}>
              {topic.phaseTitle}
            </span>
          )}
          {topic.weekNum != null && (
            <span style={{
              fontSize: 10, background: "var(--bg-secondary)",
              color: "var(--text-muted)", borderRadius: 5,
              padding: "2px 7px", border: "1px solid var(--border-subtle)",
            }}>
              Week {topic.weekNum}
            </span>
          )}
          {topic.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{
              fontSize: 10, background: "var(--bg-secondary)",
              color: "var(--text-secondary)", borderRadius: 5,
              padding: "2px 7px", border: "1px solid var(--border-subtle)",
            }}>
              {tag}
            </span>
          ))}
          {topic.mins != null && topic.mins > 0 && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center" }}>
              ⏱ ~{topic.mins} min
            </span>
          )}
        </div>

        {/* Action button */}
        <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>
          {!user ? (
            <button
              onClick={(e) => { e.stopPropagation(); navigate("/sign-in"); }}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-muted)", borderRadius: 7,
                padding: "5px 12px", fontSize: 11, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Sign in to track streak
            </button>
          ) : topic.completed ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              color: "#4ade80", fontSize: 12, fontWeight: 600,
            }}>
              <span>✓</span>
              <span>Done today!</span>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); markAsRead(); }}
              disabled={isMarking}
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", color: "#fff",
                borderRadius: 7, padding: "6px 14px",
                fontSize: 11, fontWeight: 600,
                cursor: isMarking ? "not-allowed" : "pointer",
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
  );
}
