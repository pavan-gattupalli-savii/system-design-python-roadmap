import type { Reading } from "../data/readings";
import { TYPE_ICONS, DIFF_STYLE } from "./readingsConstants";

export default function ReadingsMobileCard({
  r, myVotes, toggleVote, isBookmarked, toggleBookmark,
}: {
  r: Reading; myVotes: Set<string>; toggleVote: (id: string) => void;
  isBookmarked: boolean; toggleBookmark: (id: string) => void;
}) {
  const voted = myVotes.has(r.id);
  const ds    = r.difficulty ? DIFF_STYLE[r.difficulty] : null;

  return (
    <div style={{
      display: "flex", gap: 12,
      padding: "14px 14px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-panel)",
    }}>
      {/* Left — upvote column */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
        <button
          onClick={() => toggleVote(r.id)}
          title={voted ? "You upvoted this — click to remove" : "Upvote (sign in required)"}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: voted ? "#6366f118" : "transparent",
            border: "1px solid " + (voted ? "#818cf8" : "var(--border)"),
            color: voted ? "#818cf8" : "var(--text-muted)",
            borderRadius: 8, padding: "8px 10px", fontSize: 11, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit", minWidth: 40, transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>{voted ? "♥" : "♡"}</span>
          <span style={{ fontSize: 12 }}>{r.upvotes}</span>
        </button>
        {/* Bookmark star below upvote */}
        <button
          onClick={() => toggleBookmark(r.id)}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this reading"}
          style={{
            marginTop: 6, background: "transparent", border: "none",
            color: isBookmarked ? "#f59e0b" : "var(--text-muted)",
            cursor: "pointer", fontSize: 16, padding: "4px", lineHeight: 1,
            transition: "color 0.15s",
          }}
        >
          {isBookmarked ? "★" : "☆"}
        </button>
      </div>

      {/* Right — content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Tags row */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5, alignItems: "center" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: "var(--text-secondary)",
            background: "var(--bg-secondary)", border: "1px solid var(--border)",
            borderRadius: 4, padding: "1px 7px", whiteSpace: "nowrap",
          }}>
            {TYPE_ICONS[r.type] || "📌"} {r.type}
          </span>
          {r.difficulty && ds && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: ds.tx, background: ds.bg,
              border: "1px solid " + ds.tx + "44", borderRadius: 4, padding: "1px 7px",
            }}>
              {r.difficulty}
            </span>
          )}
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>
            {(r.createdAt ?? "").slice(0, 7)}
          </span>
        </div>

        {/* Title */}
        <a
          href={r.url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--text-bright)", textDecoration: "none", display: "block", lineHeight: 1.4, marginBottom: 4 }}
        >
          {r.title} ↗
        </a>

        {r.notes && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 7, lineHeight: 1.4 }}>{r.notes}</div>
        )}

        {/* Author + topics */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {r.githubUser ? (
            <a
              href={`https://github.com/${r.githubUser}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none", color: "var(--text-secondary)", fontSize: 10, marginRight: 4 }}
            >
              <img src={`https://github.com/${r.githubUser}.png?size=16`} alt={r.addedBy} style={{ width: 14, height: 14, borderRadius: "50%" }} />
              {r.addedBy}
            </a>
          ) : (
            <span style={{ fontSize: 10, color: "var(--text-secondary)", marginRight: 4 }}>by {r.addedBy}</span>
          )}
          {r.topics.slice(0, 4).map((t) => (
            <span key={t} style={{ fontSize: 9, color: "var(--badge-sky-tx)", background: "var(--badge-sky-bg)", border: "1px solid var(--badge-sky-border)", borderRadius: 4, padding: "1px 5px" }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
