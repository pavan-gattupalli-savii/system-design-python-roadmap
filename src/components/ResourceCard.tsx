import { lazy, Suspense, useEffect, useState } from "react";
import { TYPES } from "../data/types";
import { resId } from "../utils/stats";
import { getResourceUrl } from "../utils/url";
import type { Resource } from "../data/models";
import { useBookmarks } from "../hooks/useBookmarks";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { BuildSubmission } from "../api/builds";
import type { Language } from "../data/roadmap-index";
import type { UserNote } from "../api/notes";

// Lazy: ~10KB build-challenge UI only loads when user clicks "View Challenge".
const BuildExpandedPanel = lazy(() => import("./BuildExpandedPanel"));

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
  /** Lookup of user notes keyed by resourceKey (resId). Undefined when signed out. */
  userNotes?: Map<string, UserNote>;
  onSaveNote?: (resourceKey: string, bodyMd: string) => void;
  onDeleteNote?: (resourceKey: string) => void;
}

export function ResourceCard({
  phase, weekN, si, ri, res, completed, toggle, isMobile,
  language, buildSubmissions, onSubmitBuild, onDeleteBuild,
  userNotes, onSaveNote, onDeleteNote,
}: Props) {
  const id    = resId(phase, weekN, si, ri);
  const isDone = completed.has(id);
  const tc    = TYPES[res.type] ?? TYPES["Article"];
  const url   = getResourceUrl(res);
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.roadmap_resource.has(id);
  const navigate = useNavigate();
  const [, setParams] = useSearchParams();

  // Clicking a tag chip pushes the tag into the roadmap search query so the
  // user lands on every build sharing that tag. Search now matches spec.tags.
  function searchByTag(tag: string) {
    const next = new URLSearchParams();
    next.set("q", tag);
    setParams(next, { replace: false });
    navigate(`/app/roadmap?q=${encodeURIComponent(tag)}`);
  }

  const isBuild = res.type === "Build";
  const existing = isBuild ? buildSubmissions?.get(id) : undefined;
  // DB-loaded spec via the /api/roadmap response. The previous in-bundle
  // fallback was retired once 107/107 build_specs were seeded into Postgres.
  const spec = isBuild ? (res.spec ?? null) : null;

  const [expanded, setExpanded] = useState(false);

  // ── User notes (signed-in only) ────────────────────────────────────────────
  const existingNote = userNotes?.get(id);
  const existingBody = existingNote?.bodyMd ?? "";
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(existingBody);
  // Sync the draft when the underlying note changes (e.g. after a save settles
  // and the query refetches). Using useEffect avoids the setState-in-render
  // anti-pattern that React tolerates but warns about under strict mode.
  useEffect(() => {
    setNoteDraft(existingBody);
  }, [existingBody]);
  const noteDirty = noteDraft !== existingBody;

  // Server already computes the matched concept and ships it on res.linkedConcept.
  const linkedConcept = res.linkedConcept ?? null;

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

        {/* Note button — only when signed in (userNotes provided) */}
        {language && onSaveNote && (
          <button
            onClick={(e) => { e.stopPropagation(); setNoteOpen((v) => !v); }}
            title={existingNote ? "Edit note" : "Add note"}
            style={{
              background: "transparent", border: "none",
              color: existingNote ? "#6ee7b7" : "var(--text-muted)",
              cursor: "pointer", fontSize: 14, padding: "4px", lineHeight: 1,
              marginTop: 2, transition: "color 0.15s",
            }}
          >
            {existingNote ? "📝" : "✎"}
          </button>
        )}
      </div>

      {/* ── Note editor ─────────────────────────────────────────── */}
      {noteOpen && language && onSaveNote && (
        <div style={{
          marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
            📝 Your notes (markdown)
          </div>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Capture takeaways, gotchas, links to your code…"
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "8px 10px",
              color: "var(--text-body)", fontSize: 12, fontFamily: "inherit",
              outline: "none", resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => onSaveNote(id, noteDraft)}
              disabled={!noteDirty || noteDraft.trim() === ""}
              style={{
                background: noteDirty && noteDraft.trim() !== "" ? "#6366f1" : "var(--bg-card)",
                color: noteDirty && noteDraft.trim() !== "" ? "#fff" : "var(--text-muted)",
                border: "none", borderRadius: 6, padding: "5px 12px",
                fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                cursor: noteDirty && noteDraft.trim() !== "" ? "pointer" : "default",
              }}
            >
              Save
            </button>
            {existingNote && onDeleteNote && (
              <button
                onClick={() => { onDeleteNote(id); setNoteOpen(false); }}
                style={{
                  background: "transparent", color: "#f87171",
                  border: "1px solid #f8717144", borderRadius: 6,
                  padding: "4px 10px", fontSize: 11, fontWeight: 600,
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
            {existingNote && (
              <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>
                updated {new Date(existingNote.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Build expanded panel (lazy-loaded ~10KB) ──────────────────────────────────── */}
      {isBuild && expanded && (
        <Suspense fallback={null}>
          <BuildExpandedPanel
            id={id}
            res={res}
            spec={spec}
            isMobile={isMobile}
            existing={existing}
            language={language}
            onSubmitBuild={onSubmitBuild}
            onDeleteBuild={onDeleteBuild}
            searchByTag={searchByTag}
          />
        </Suspense>
      )}
    </div>
  );
}
