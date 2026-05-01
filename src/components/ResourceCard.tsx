import { useState } from "react";
import { TYPES } from "../data/types";
import { resId } from "../utils/stats";
import { getResourceUrl } from "../utils/url";
import type { Resource } from "../data/models";
import { useBookmarks } from "../hooks/useBookmarks";
import { CONCEPTS } from "../data/concepts/index";
import { Link } from "react-router-dom";
import type { BuildSubmission } from "../api/builds";
import type { Language } from "../data/roadmap-index";

interface Props {
  phase: number;
  weekN: number;
  si: number;
  ri: number;
  res: Resource;
  completed: Set<string>;
  toggle: (id: string) => void;
  isMobile: boolean;
  language?: Language;
  buildSubmissions?: Map<string, BuildSubmission>;
  onSubmitBuild?: (resourceKey: string, githubUrl: string, notes?: string) => void;
  onDeleteBuild?: (resourceKey: string) => void;
}

export function ResourceCard({
  phase, weekN, si, ri, res, completed, toggle, isMobile,
  language, buildSubmissions, onSubmitBuild, onDeleteBuild,
}: Props) {
  const id    = resId(phase, weekN, si, ri);
  const isDone = completed.has(id);
  const tc    = TYPES[res.type] ?? TYPES["Article"];
  const url   = getResourceUrl(res);
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.roadmap_resource.has(id);

  const isBuild = res.type === "Build";
  const existing = isBuild ? buildSubmissions?.get(id) : undefined;

  const [expanded, setExpanded] = useState(false);
  const [ghUrl, setGhUrl] = useState(existing?.githubUrl ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [urlError, setUrlError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Keep local form in sync if the query reloads with fresh data
  const existingKey = existing?.githubUrl ?? "";
  const [lastSynced, setLastSynced] = useState(existingKey);
  if (existingKey !== lastSynced) {
    setGhUrl(existing?.githubUrl ?? "");
    setNotes(existing?.notes ?? "");
    setLastSynced(existingKey);
  }

  // Cross-link: find first concept whose keywords match this resource
  const linkedConcept = CONCEPTS.find((c) =>
    c.roadmapKeywords?.some((kw) =>
      res.item.toLowerCase().includes(kw) || res.where.toLowerCase().includes(kw),
    ),
  ) ?? null;

  async function handleSubmit() {
    const trimmed = ghUrl.trim();
    if (!trimmed.startsWith("https://github.com/")) {
      setUrlError("Must be a https://github.com/ URL");
      return;
    }
    try { new URL(trimmed); } catch {
      setUrlError("URL is malformed");
      return;
    }
    setUrlError("");
    setSaving(true);
    onSubmitBuild?.(id, trimmed, notes.trim() || undefined);
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    onDeleteBuild?.(id);
    setDeleting(false);
    setGhUrl("");
    setNotes("");
  }

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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isBuild && existing && (
                <span style={{ fontSize: 10, color: "#4ade80", background: "#4ade8018", border: "1px solid #4ade8040", borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>
                  ✓ Submitted
                </span>
              )}
              <span style={{ fontSize: 11, color: "#475569" }}>{res.mins} min</span>
            </div>
          </div>

          {/* Title */}
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

          {/* Where / hint — hidden for Build when expanded (shown in detail panel) */}
          {!isBuild && (
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 5, lineHeight: 1.4 }}>
              <span style={{ color: "var(--text-muted)" }}>→ </span>
              {res.where}
            </div>
          )}

          {/* Concept cross-link chip */}
          {linkedConcept && (
            <Link
              to={`/app/concepts/${linkedConcept.slug}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                marginTop: 7, padding: "2px 8px", borderRadius: 10,
                background: "#6366f111", border: "1px solid #6366f133",
                color: "#a5b4fc", fontSize: 10, fontWeight: 600,
                textDecoration: "none", whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#6366f122")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#6366f111")}
            >
              📖 {linkedConcept.title} →
            </Link>
          )}

          {/* Build expand toggle */}
          {isBuild && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5,
                background: expanded ? "#6366f118" : "transparent",
                border: "1px solid #6366f144", borderRadius: 6,
                color: "#a5b4fc", fontSize: 11, fontWeight: 600,
                padding: "4px 10px", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {expanded ? "▲ Hide details" : "▶ View Challenge"}
            </button>
          )}
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

      {/* ── Build expanded panel ──────────────────────────────────── */}
      {isBuild && expanded && (
        <div style={{
          marginTop: 14,
          borderTop: "1px solid #3b1f7b",
          paddingTop: 14,
          display: "flex", flexDirection: "column", gap: 12,
        }}>

          {/* Challenge spec */}
          <div>
            <div style={{ fontSize: 10, color: "#c4b5fd", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
              🔨 Challenge
            </div>
            <div style={{
              background: "#0f0a2a",
              border: "1px solid #3b1f7b",
              borderRadius: 7,
              padding: "12px 14px",
              fontSize: isMobile ? 12 : 13,
              color: "#ddd6fe",
              lineHeight: 1.65,
            }}>
              {res.item}
            </div>
          </div>

          {/* Extension / bonus */}
          {res.where && (
            <div style={{
              background: "#1a0a3b",
              border: "1px solid #4c1d9555",
              borderRadius: 7,
              padding: "10px 14px",
              display: "flex", gap: 8,
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Extension</div>
                <div style={{ fontSize: 12, color: "#c4b5fd", lineHeight: 1.6 }}>{res.where}</div>
              </div>
            </div>
          )}

          {/* Time + submitted link */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#7c6fa0", background: "#1a0a3b", border: "1px solid #3b1f7b", borderRadius: 4, padding: "2px 8px" }}>
              ⏱ {res.mins} min
            </span>
            {existing && (
              <a
                href={existing.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11, color: "#4ade80", background: "#4ade8012",
                  border: "1px solid #4ade8035", borderRadius: 4, padding: "2px 10px",
                  textDecoration: "none", fontWeight: 600,
                }}
              >
                ✓ View submission ↗
              </a>
            )}
          </div>

          {/* Submit form */}
          {language && onSubmitBuild ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                {existing ? "Update submission" : "Submit your build"}
              </div>

              {/* GitHub URL */}
              <div>
                <input
                  type="url"
                  placeholder="https://github.com/you/repo"
                  value={ghUrl}
                  onChange={(e) => { setGhUrl(e.target.value); setUrlError(""); }}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "#0f0a2a", border: "1px solid " + (urlError ? "#f87171" : "#3b1f7b"),
                    borderRadius: 6, padding: "8px 10px",
                    color: "#e2e8f0", fontSize: 12, fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                {urlError && (
                  <div style={{ fontSize: 11, color: "#f87171", marginTop: 3 }}>{urlError}</div>
                )}
              </div>

              {/* Notes */}
              <textarea
                placeholder="Optional: what did you build, what you learned, challenges…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#0f0a2a", border: "1px solid #3b1f7b",
                  borderRadius: 6, padding: "8px 10px",
                  color: "#e2e8f0", fontSize: 12, fontFamily: "inherit",
                  outline: "none", resize: "vertical",
                }}
              />

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !ghUrl.trim()}
                  style={{
                    background: saving ? "#4c1d95" : "#6366f1",
                    color: "#fff", border: "none",
                    borderRadius: 6, padding: "7px 16px",
                    fontSize: 12, fontWeight: 700,
                    cursor: saving || !ghUrl.trim() ? "default" : "pointer",
                    fontFamily: "inherit", opacity: saving || !ghUrl.trim() ? 0.6 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {saving ? "Saving…" : existing ? "Update" : "Submit Build"}
                </button>
                {existing && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      background: "transparent", color: "#f87171",
                      border: "1px solid #f8717144", borderRadius: 6,
                      padding: "6px 12px", fontSize: 11, fontWeight: 600,
                      cursor: deleting ? "default" : "pointer",
                      fontFamily: "inherit", opacity: deleting ? 0.6 : 1,
                    }}
                  >
                    {deleting ? "Removing…" : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ) : isBuild && !language ? (
            <div style={{ fontSize: 12, color: "#7c6fa0", fontStyle: "italic" }}>
              Sign in to submit your build link.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

