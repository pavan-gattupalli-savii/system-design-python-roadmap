// ── NotesTab ──────────────────────────────────────────────────────────────────
// Browse and edit every note the current user has captured. Notes are scoped
// per language; the active language in the global layout determines which
// notes show. Each note links back to its roadmap resource so one click jumps
// to the source.

import { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { useRoadmap } from "../hooks/useRoadmap";
import type { LayoutContext } from "./Layout";

export default function NotesTab() {
  const ctx = useOutletContext<LayoutContext>();
  const { notes, save, remove } = useNotes(ctx.lang);
  const { phases } = useRoadmap(ctx.lang);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // Build a quick lookup: resourceKey → { phase, weekN, sessionLabel, item }
  const lookup = new Map<string, { phase: number; weekN: number; item: string; weekTitle: string }>();
  for (const p of phases) {
    for (const w of p.weeks) {
      for (let si = 0; si < w.sessions.length; si++) {
        const s = w.sessions[si];
        for (let ri = 0; ri < s.resources.length; ri++) {
          const r = s.resources[ri];
          lookup.set(`${p.phase}_${w.n}_${si}_${ri}`, { phase: p.phase, weekN: w.n, item: r.item, weekTitle: w.title });
        }
      }
    }
  }

  const sortedNotes = [...notes.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  function startEdit(key: string, current: string) {
    setEditingKey(key);
    setDraft(current);
  }
  function cancelEdit() {
    setEditingKey(null);
    setDraft("");
  }
  function commit() {
    if (editingKey === null) return;
    save({ resourceKey: editingKey, bodyMd: draft });
    setEditingKey(null);
    setDraft("");
  }

  if (sortedNotes.length === 0) {
    return (
      <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "30px 4px", textAlign: "center", lineHeight: 1.7 }}>
        No notes yet ({ctx.lang}).<br />
        Open any roadmap resource and click <span style={{ color: "#a5b4fc" }}>✎</span> to capture your first note.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        {sortedNotes.length} note{sortedNotes.length === 1 ? "" : "s"} ({ctx.lang})
      </div>
      {sortedNotes.map((n) => {
        const meta = lookup.get(n.resourceKey);
        const isEditing = editingKey === n.resourceKey;
        return (
          <div key={n.resourceKey} style={{
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                {meta ? (
                  <Link
                    to={`/app/roadmap/phase/${meta.phase}/week/${meta.weekN}`}
                    style={{ fontSize: 12, color: "#a5b4fc", textDecoration: "none", fontWeight: 600 }}
                  >
                    Phase {meta.phase} · Week {meta.weekN} → {meta.item.slice(0, 60)}{meta.item.length > 60 ? "…" : ""}
                  </Link>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{n.resourceKey}</span>
                )}
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  updated {new Date(n.updatedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {!isEditing && (
                  <>
                    <button
                      onClick={() => startEdit(n.resourceKey, n.bodyMd)}
                      style={btnStyle("#6366f1")}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove({ resourceKey: n.resourceKey })}
                      style={btnStyle("#f87171", true)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "var(--bg-secondary)", border: "1px solid var(--border-mid)",
                    borderRadius: 6, padding: "8px 10px",
                    color: "var(--text-body)", fontSize: 12, fontFamily: "inherit",
                    outline: "none", resize: "vertical",
                  }}
                />
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button onClick={commit} disabled={draft.trim() === ""} style={btnStyle("#6366f1")}>Save</button>
                  <button onClick={cancelEdit} style={btnStyle("transparent", true)}>Cancel</button>
                </div>
              </>
            ) : (
              <pre style={{
                margin: 0, fontFamily: "inherit", fontSize: 12,
                color: "var(--text-body)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {n.bodyMd}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

function btnStyle(bg: string, outlined = false): React.CSSProperties {
  return {
    background:  outlined ? "transparent" : bg,
    color:       outlined ? bg : "#fff",
    border:      outlined ? `1px solid ${bg}55` : "none",
    borderRadius: 6,
    padding:     "5px 12px",
    fontSize:    11,
    fontWeight:  600,
    cursor:      "pointer",
    fontFamily:  "inherit",
  };
}
