// ── BookmarksTab — "My Bookmarks" panel on Profile page ──────────────────────
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchResolvedBookmarks, type ResolvedBookmarkItem } from "../api/bookmarks";
import { useBookmarks } from "../hooks/useBookmarks";
import { useAuth } from "../lib/auth";

// ── Section ───────────────────────────────────────────────────────────────────
function BookmarkSection({
  title,
  items,
  emptyHref,
  emptyLabel,
  onRemove,
}: {
  title: string;
  items: ResolvedBookmarkItem[];
  emptyHref: string;
  emptyLabel: string;
  onRemove: (id: string) => void;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{
        fontSize: 13, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase",
        color: "var(--text-muted)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8,
      }}>
        {title}
        <span style={{
          background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
          borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 600,
          color: "var(--text-secondary)",
        }}>
          {items.length}
        </span>
      </h3>

      {items.length === 0 ? (
        <div style={{
          padding: "20px 16px", background: "var(--bg-panel)", borderRadius: 10,
          border: "1px dashed var(--border-subtle)", textAlign: "center",
          fontSize: 13, color: "var(--text-muted)",
        }}>
          No bookmarks yet.{" "}
          <Link to={emptyHref} style={{ color: "var(--accent)", textDecoration: "none" }}>
            {emptyLabel} →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--text-heading)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {item.title}
                    <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 5, opacity: 0.75 }}>↗</span>
                  </a>
                ) : (
                  <span style={{ color: "var(--text-heading)", fontSize: 13, fontWeight: 500 }}>
                    {item.title}
                  </span>
                )}
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{item.meta}</div>
              </div>

              {/* Remove bookmark */}
              <button
                onClick={() => onRemove(item.id)}
                title="Remove bookmark"
                style={{
                  flexShrink: 0, background: "transparent", border: "none",
                  color: "#f59e0b", cursor: "pointer", fontSize: 18,
                  padding: "4px 6px", lineHeight: 1, transition: "color 0.15s",
                }}
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BookmarksTab() {
  const { user } = useAuth();
  const { toggleBookmark } = useBookmarks();

  const { data, isLoading, error } = useQuery({
    queryKey: ["me", "bookmarks-resolved"],
    queryFn:  fetchResolvedBookmarks,
    enabled:  !!user,
    staleTime: 60_000,
  });

  if (!user) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        <Link to="/sign-in?next=/app/profile" style={{ color: "var(--accent)" }}>Sign in</Link> to see your bookmarks.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading bookmarks…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#f87171", fontSize: 13 }}>
        Failed to load bookmarks.
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px", maxWidth: 720, margin: "0 auto" }}>
      <BookmarkSection
        title="Readings"
        items={data.reading}
        emptyHref="/app/readings"
        emptyLabel="Browse readings"
        onRemove={(id) => toggleBookmark("reading", id)}
      />
      <BookmarkSection
        title="Interview Experiences"
        items={data.experience}
        emptyHref="/app/interview"
        emptyLabel="Browse experiences"
        onRemove={(id) => toggleBookmark("experience", id)}
      />
      <BookmarkSection
        title="Interview Questions"
        items={data.question}
        emptyHref="/app/interview"
        emptyLabel="Browse questions"
        onRemove={(id) => toggleBookmark("question", id)}
      />
      <BookmarkSection
        title="Roadmap Resources"
        items={data.roadmap_resource}
        emptyHref="/app/roadmap"
        emptyLabel="Browse roadmap"
        onRemove={(id) => toggleBookmark("roadmap_resource", id)}
      />
    </div>
  );
}
