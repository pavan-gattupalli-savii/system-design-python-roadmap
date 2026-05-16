import { useEffect, useState } from "react";
import type { BuildSpec, Resource } from "../data/models";
import type { BuildSubmission } from "../api/builds";
import type { Language } from "../data/roadmap-index";

interface Props {
  id: string;
  res: Resource;
  spec: BuildSpec | null;
  isMobile: boolean;
  existing: BuildSubmission | undefined;
  language?: Language;
  onSubmitBuild?: (resourceKey: string, githubUrl: string, notes?: string) => void;
  onDeleteBuild?: (resourceKey: string) => void;
  searchByTag: (tag: string) => void;
}

const difficultyStyle: Record<string, { color: string; bg: string; border: string }> = {
  beginner:     { color: "#4ade80", bg: "#4ade8012", border: "#4ade8033" },
  intermediate: { color: "#fb923c", bg: "#fb923c12", border: "#fb923c33" },
  advanced:     { color: "#f87171", bg: "#f8717112", border: "#f8717133" },
};

export default function BuildExpandedPanel({
  id, res, spec, isMobile, existing, language,
  onSubmitBuild, onDeleteBuild, searchByTag,
}: Props) {
  const [ghUrl, setGhUrl] = useState(existing?.githubUrl ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [urlError, setUrlError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const existingGh = existing?.githubUrl ?? "";
  const existingNotes = existing?.notes ?? "";
  useEffect(() => {
    setGhUrl(existingGh);
    setNotes(existingNotes);
  }, [existingGh, existingNotes]);

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
      ) : !language ? (
        <div style={{ fontSize: 12, color: "#7c6fa0", fontStyle: "italic" }}>
          Sign in to submit your build link.
        </div>
      ) : null}
    </div>
  );
}
