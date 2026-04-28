import { TYPES } from "../data/types";
import { resId } from "../utils/stats";
import { getResourceUrl } from "../utils/url";
import type { Resource } from "../data/models";
import { useBookmarks } from "../hooks/useBookmarks";

interface Props {
  phase: number;
  weekN: number;
  si: number;
  ri: number;
  res: Resource;
  completed: Set<string>;
  toggle: (id: string) => void;
  isMobile: boolean;
}

export function ResourceCard({ phase, weekN, si, ri, res, completed, toggle, isMobile }: Props) {
  const id    = resId(phase, weekN, si, ri);
  const isDone = completed.has(id);
  const tc    = TYPES[res.type] ?? TYPES["Article"];
  const url   = getResourceUrl(res);
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.roadmap_resource.has(id);

  return (
    <div
      className={"resource-card" + (isDone ? " done" : "")}
      style={{
        background: tc.bg,
        border: "1px solid " + tc.tx + "22",
        borderRadius: 8,
        padding: isMobile ? "10px 12px" : "12px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Type badge + duration */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: tc.tx, background: tc.tx + "14", border: "1px solid " + tc.tx + "28", borderRadius: 4, padding: "2px 7px", letterSpacing: 1, textTransform: "uppercase" }}>
              {tc.icon} {res.type}
            </span>
            <span style={{ fontSize: 11, color: "#475569" }}>{res.mins} min</span>
          </div>

          {/* Title — clickable when a URL is resolvable */}
          <div
            className="resource-title"
            style={{ fontSize: isMobile ? 12 : 13, color: isDone ? "var(--text-dim)" : "var(--text-heading)", lineHeight: 1.5, fontWeight: 500 }}
          >
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                onClick={(e) => e.stopPropagation()}
              >
                {res.item}
                <span style={{ fontSize: 10, color: tc.tx, marginLeft: 5, opacity: 0.75 }}>↗</span>
              </a>
            ) : (
              res.item
            )}
          </div>

          {/* Where / source hint */}
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 5, lineHeight: 1.4 }}>
            <span style={{ color: "var(--text-muted)" }}>→ </span>
            {res.where}
          </div>
        </div>

        {/* Completion toggle */}
        <button
          className="check-btn"
          onClick={(e) => { e.stopPropagation(); toggle(id); }}
          aria-label={isDone ? "Mark as not done" : "Mark as done"}
          style={{ marginTop: 2 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{isDone ? "✅" : "⬜"}</span>
        </button>

        {/* Bookmark star */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleBookmark("roadmap_resource", id); }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this resource"}
          style={{
            background: "transparent", border: "none",
            color: isBookmarked ? "#f59e0b" : "var(--text-muted)",
            cursor: "pointer", fontSize: 16, padding: "4px", lineHeight: 1,
            marginTop: 2, transition: "color 0.15s",
          }}
        >
          {isBookmarked ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}
