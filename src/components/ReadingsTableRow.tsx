import React from "react";
import type { Reading } from "../data/readings";
import { TYPE_ICONS, DIFF_STYLE } from "./readingsConstants";

export default function ReadingsTableRow({
  r, idx, myVotes, toggleVote, isBookmarked, toggleBookmark,
}: {
  r: Reading; idx: number; myVotes: Set<string>; toggleVote: (id: string) => void;
  isBookmarked: boolean; toggleBookmark: (id: string) => void;
}) {
  const voted  = myVotes.has(r.id);
  const ds     = r.difficulty ? DIFF_STYLE[r.difficulty] : null;
  const rowBg  = idx % 2 === 0 ? "var(--bg-page)" : "var(--bg-panel)";

  const cellBase: React.CSSProperties = {
    verticalAlign: "middle",
    borderTop: "1px solid var(--border-subtle)",
    borderBottom: "1px solid var(--border-subtle)",
  };

  return (
    <tr
      style={{ background: rowBg, transition: "background 0.12s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
    >
      {/* ♥ Save — first column */}
      <td style={{
        ...cellBase, padding: "10px 6px", textAlign: "center",
        borderLeft: "1px solid var(--border-subtle)", borderRadius: "8px 0 0 8px",
      }}>
        <button
          onClick={() => toggleVote(r.id)}
          title={voted ? "You upvoted this — click to remove" : "Upvote (sign in required)"}
          style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: voted ? "#6366f118" : "transparent",
            border: "1px solid " + (voted ? "#818cf8" : "var(--border)"),
            color: voted ? "#818cf8" : "var(--text-muted)",
            borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", minWidth: 36, transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>{voted ? "♥" : "♡"}</span>
          <span style={{ fontSize: 10 }}>{r.upvotes}</span>
        </button>
      </td>

      {/* ★ Bookmark */}
      <td style={{ ...cellBase, padding: "10px 6px", textAlign: "center" }}>
        <button
          onClick={() => toggleBookmark(r.id)}
          title={isBookmarked ? "Remove bookmark" : "Bookmark"}
          style={{
            background: "transparent", border: "none",
            color: isBookmarked ? "#f59e0b" : "var(--text-muted)",
            cursor: "pointer", fontSize: 16, padding: "4px", lineHeight: 1,
            transition: "color 0.15s",
          }}
        >
          {isBookmarked ? "★" : "☆"}
        </button>
      </td>

      {/* Type */}
      <td style={{ ...cellBase, padding: "10px 14px" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 10, fontWeight: 600, color: "var(--text-secondary)",
          background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
          borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap",
        }}>
          <span>{TYPE_ICONS[r.type] || "📌"}</span>
          <span>{r.type}</span>
        </span>
      </td>

      {/* Title */}
      <td style={{ ...cellBase, padding: "10px 14px" }}>
        <a
          href={r.url} target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--text-bright)", fontWeight: 600, fontSize: 13, textDecoration: "none", lineHeight: 1.45, display: "block" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#818cf8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-bright)")}
        >
          {r.title} <span style={{ fontSize: 10, opacity: 0.55 }}>↗</span>
        </a>
        {r.notes && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.4 }}>{r.notes}</div>
        )}
      </td>

      {/* Difficulty */}
      <td style={{ ...cellBase, padding: "10px 14px" }}>
        {r.difficulty && ds ? (
          <span style={{
            fontSize: 10, fontWeight: 700, color: ds.tx, background: ds.bg,
            border: "1px solid " + ds.tx + "44", borderRadius: 5, padding: "3px 9px", whiteSpace: "nowrap",
          }}>
            {r.difficulty}
          </span>
        ) : <span style={{ color: "var(--text-dim)", fontSize: 14 }}>—</span>}
      </td>

      {/* Added by — GitHub avatar + name link */}
      <td style={{ ...cellBase, padding: "10px 14px" }}>
        {r.githubUser ? (
          <a
            href={`https://github.com/${r.githubUser}`} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-bright)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            <img
              src={`https://github.com/${r.githubUser}.png?size=32`} alt={r.addedBy}
              style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: "1px solid var(--border)" }}
            />
            <span style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 84 }}>
              {r.addedBy}
            </span>
          </a>
        ) : (
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.addedBy}</span>
        )}
      </td>

      {/* Topics */}
      <td style={{ ...cellBase, padding: "10px 14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {r.topics.slice(0, 4).map((t) => (
            <span key={t} style={{
              fontSize: 9, color: "var(--badge-sky-tx)", background: "var(--badge-sky-bg)",
              border: "1px solid var(--badge-sky-border)", borderRadius: 4, padding: "2px 7px",
            }}>
              #{t}
            </span>
          ))}
          {r.topics.length > 4 && (
            <span style={{ fontSize: 9, color: "var(--text-muted)", alignSelf: "center" }}>+{r.topics.length - 4}</span>
          )}
        </div>
      </td>

      {/* Date */}
      <td style={{
        ...cellBase, padding: "10px 14px",
        color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: 11,
        borderRight: "1px solid var(--border-subtle)", borderRadius: "0 8px 8px 0",
      }}>
        {(r.createdAt ?? "").slice(0, 7)}
      </td>
    </tr>
  );
}
