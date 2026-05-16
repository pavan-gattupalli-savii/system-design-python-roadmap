import { useEffect, useState } from "react";
import { TYPES } from "../data/types";
import { resId } from "../utils/stats";
import { getResourceUrl } from "../utils/url";
import type { Resource } from "../data/models";
import { useBookmarks } from "../hooks/useBookmarks";
import { useConcepts } from "../hooks/useConcepts";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { BuildSubmission } from "../api/builds";
import type { Language } from "../data/roadmap-index";
import type { UserNote } from "../api/notes";

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

  const difficultyStyle: Record<string, { color: string; bg: string; border: string }> = {
    beginner:     { color: "#4ade80", bg: "#4ade8012", border: "#4ade8033" },
    intermediate: { color: "#fb923c", bg: "#fb923c12", border: "#fb923c33" },
    advanced:     { color: "#f87171", bg: "#f8717112", border: "#f8717133" },
  };

  const [expanded, setExpanded] = useState(false);
  const [ghUrl, setGhUrl] = useState(existing?.githubUrl ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [urlError, setUrlError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Keep the build-submission form in sync when the query reloads. Effect-based
  // sync is cleaner than the setState-in-render pattern React tolerates but warns.
  const existingGh = existing?.githubUrl ?? "";
  const existingNotes = existing?.notes ?? "";
  useEffect(() => {
    setGhUrl(existingGh);
    setNotes(existingNotes);
  }, [existingGh, existingNotes]);

  // Cross-link: find first concept whose keywords match this resource
  const { concepts: allConcepts } = useConcepts();
  const linkedConcept = allConcepts.find((c) =>
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

      {/* ── Build expanded panel ──────────────────────────────────── */}
      {isBuild && expanded && (
        <div style={{
          marginTop: 14,
          borderTop: "1px solid #3b1f7b",
          paddingTop: 14,
          display: "flex", flexDirection: "column", gap: 12,
        }}>

          {/* ── Rich spec (if in BUILD_SPECS) ── */}
          {spec ? (
            <>
              {/* Difficulty + est_hours + tags row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 1,
                  textTransform: "uppercase", padding: "2px 10px", borderRadius: 20,
                  color: difficultyStyle[spec.difficulty].color,
                  background: difficultyStyle[spec.difficulty].bg,
                  border: "1px solid " + difficultyStyle[spec.difficulty].border,
                }}>
                  {spec.difficulty === "beginner" ? "🟢" : spec.difficulty === "intermediate" ? "🟠" : "🔴"} {spec.difficulty}
                </span>
                {(spec.estHours ?? 0) > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    color: "#fbbf24", background: "#fbbf2412", border: "1px solid #fbbf2433",
                  }}>
                    ⏱ ~{spec.estHours}h
                  </span>
                )}
                {(spec.tags ?? []).map((t) => (
                  <button
                    key={t}
                    onClick={(e) => { e.stopPropagation(); searchByTag(t); }}
                    title={`Find all builds tagged "${t}"`}
                    style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 4,
                      color: "#a5b4fc", background: "#6366f112",
                      border: "1px solid #6366f133",
                      cursor: "pointer", fontFamily: "inherit", lineHeight: 1.4,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#6366f128"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#6366f112"; }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Overview */}
              <div style={{ fontSize: isMobile ? 12 : 13, color: "#c4b5fd", lineHeight: 1.7 }}>
                {spec.overview}
              </div>

              {/* Requirements */}
              <div>
                <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>📋 Requirements</div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                  {spec.requirements.map((req, i) => (
                    <li key={i} style={{ fontSize: isMobile ? 11 : 12, color: "#ddd6fe", lineHeight: 1.6 }}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Acceptance criteria */}
              <div>
                <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>✅ Acceptance Criteria</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {spec.acceptance.map((ac, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: isMobile ? 11 : 12, color: "#ddd6fe", lineHeight: 1.6 }}>
                      <span style={{ color: "#4ade80", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{ac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architecture diagram */}
              {spec.diagram && (
                <div>
                  <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>🗺 Architecture</div>
                  <pre style={{
                    margin: 0,
                    background: "#050213",
                    border: "1px solid #3b1f7b",
                    borderRadius: 7,
                    padding: "12px 14px",
                    fontSize: 11,
                    color: "#a5b4fc",
                    lineHeight: 1.5,
                    overflowX: "auto",
                    whiteSpace: "pre",
                    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  }}>{spec.diagram}</pre>
                </div>
              )}

              {/* Hints */}
              {spec.hints && spec.hints.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>💡 Hints</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {spec.hints.map((hint, i) => (
                      <div key={i} style={{
                        background: "#1a0a3b",
                        border: "1px solid #4c1d9555",
                        borderRadius: 6,
                        padding: "8px 12px",
                        fontSize: isMobile ? 11 : 12,
                        color: "#c4b5fd",
                        lineHeight: 1.6,
                      }}>{hint}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common pitfalls (warning panel) */}
              {spec.pitfalls && spec.pitfalls.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#f87171", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>⚠️ Common Pitfalls</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {spec.pitfalls.map((p, i) => (
                      <div key={i} style={{
                        background: "#3b0a0a",
                        border: "1px solid #7f1d1d55",
                        borderRadius: 6,
                        padding: "8px 12px",
                        fontSize: isMobile ? 11 : 12,
                        color: "#fca5a5",
                        lineHeight: 1.6,
                      }}>{p}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stretch goals */}
              {spec.stretchGoals && spec.stretchGoals.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#86efac", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>🚀 Stretch Goals</div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                    {spec.stretchGoals.map((g, i) => (
                      <li key={i} style={{ fontSize: isMobile ? 11 : 12, color: "#bbf7d0", lineHeight: 1.6 }}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {spec.prerequisites && spec.prerequisites.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>🧰 Prerequisites</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {spec.prerequisites.map((pr, i) => (
                      <span key={i} style={{
                        fontSize: 11, padding: "3px 9px", borderRadius: 12,
                        background: "#0f2a18", color: "#6ee7b7", border: "1px solid #1a4d2e",
                      }}>{pr}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {spec.references && spec.references.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, fontWeight: 700 }}>🔗 References</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {spec.references.map((ref, i) => (
                      <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: isMobile ? 11 : 12, color: "#67e8f9", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        <span>↗</span>
                        <span>{ref.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Fallback: show raw item text if no spec written yet */
            <div>
              <div style={{ fontSize: 10, color: "#c4b5fd", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>🔨 Challenge</div>
              <div style={{
                background: "#0f0a2a",
                border: "1px solid #3b1f7b",
                borderRadius: 7,
                padding: "12px 14px",
                fontSize: isMobile ? 12 : 13,
                color: "#ddd6fe",
                lineHeight: 1.65,
              }}>{res.item}</div>
            </div>
          )}

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
