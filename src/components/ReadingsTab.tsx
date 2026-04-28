// ── READINGS TAB ──────────────────────────────────────────────────────────────
// Community-curated resources, contributed via the in-app submission form.
// Filters: type · difficulty · topic · search. Sort: newest / top / A-Z.
// Upvotes: per-user, persisted in the DB (see useMyInteractions).

import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { POST_TYPES, DIFFICULTIES } from "../data/readings";
import type { Reading } from "../data/readings";
import { apiFetch } from "../api/client";
import { buildReadingsUrl } from "../api/readings";
import { useAuth } from "../lib/auth";
import { useMyInteractions } from "../hooks/useMyInteractions";

const SUBMIT_PATH = "/app/readings/submit";

// ── Icon + colour maps ────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, string> = {
  Blog: "✍️", YouTube: "▶️", LinkedIn: "💼", Book: "📖", Paper: "📄",
  Course: "🎓", Newsletter: "📬", Thread: "🧵", Docs: "📘", Website: "🌐",
  Podcast: "🎙️", Tool: "🔧", Repo: "⭐", Slide: "🖥️", "Case Study": "🔬",
};

const DIFF_STYLE: Record<string, { bg: string; tx: string }> = {
  Beginner:     { bg: "var(--badge-green-bg)",  tx: "var(--badge-green-tx)"  },
  Intermediate: { bg: "var(--badge-amber-bg)",  tx: "var(--badge-amber-tx)"  },
  Advanced:     { bg: "var(--badge-indigo-bg)", tx: "var(--badge-indigo-tx)" },
};

type SortKey = "newest" | "top" | "alpha";

function allTopics(rs: Reading[]): string[] {
  const s = new Set<string>();
  rs.forEach((r) => r.topics.forEach((t) => s.add(t)));
  return [...s].sort();
}

// ── Main component ────────────────────────────────────────────────────────────
export function ReadingsTab({ isMobile }: { isMobile: boolean }) {
  const [search,        setSearch]        = useState("");
  const [activeTypes,   setActiveTypes]   = useState<Set<string>>(new Set());
  const [activeDiff,    setActiveDiff]    = useState("");
  const [activeTopic,   setActiveTopic]   = useState("");
  const [sort,          setSort]          = useState<SortKey>("newest");
  const [showFilters,   setShowFilters]   = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: interactions, toggleReadingUpvote } = useMyInteractions();
  const myVotes = interactions.readingUpvotes;

  // ── API fetch ─────────────────────────────────────────────────────────────
  const apiUrl = buildReadingsUrl({ sort, limit: 200 });
  const { data: apiResp, isLoading: loading, error } = useQuery({
    queryKey: ["readings", sort],
    queryFn:  () => apiFetch<{ data: Reading[]; page: number; limit: number }>(apiUrl),
  });
  const fetchError = error instanceof Error ? error.message : null;
  const allReadings = apiResp?.data ?? [];

  const topics = useMemo(() => allTopics(allReadings), [allReadings]);

  const toggleVote = useCallback((id: string) => {
    if (!user) {
      navigate("/sign-in?next=/app/readings");
      return;
    }
    const isOn = !myVotes.has(id);
    toggleReadingUpvote.mutate({ id, on: isOn });
  }, [user, myVotes, toggleReadingUpvote, navigate]);

  function toggleType(t: string) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let res = allReadings.filter((r) => {
      if (activeTypes.size > 0 && !activeTypes.has(r.type)) return false;
      if (activeDiff  && r.difficulty !== activeDiff)        return false;
      if (activeTopic && !r.topics.includes(activeTopic))    return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.addedBy.toLowerCase().includes(q) ||
        (r.githubUser || "").toLowerCase().includes(q) ||
        r.topics.some((t) => t.includes(q)) ||
        r.type.toLowerCase().includes(q) ||
        (r.notes || "").toLowerCase().includes(q)
      );
    });
    if (sort === "top")   res = [...res].sort((a, b) => b.upvotes - a.upvotes);
    if (sort === "alpha") res = [...res].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "newest")res = [...res].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return res;
  }, [search, activeTypes, activeDiff, activeTopic, sort, allReadings]);

  const activeFilterCount = activeTypes.size + (activeDiff ? 1 : 0) + (activeTopic ? 1 : 0);
  const hasFilters = activeFilterCount > 0 || !!search;

  function clearAll() {
    setSearch(""); setActiveTypes(new Set()); setActiveTopic(""); setActiveDiff("");
  }

  const [page, setPage] = useState(1);
  const READINGS_PAGE_SIZE = 15;

  // Reset page on filter change
  React.useEffect(() => { setPage(1); }, [search, activeTypes, activeDiff, activeTopic, sort]);

  const pagedReadings = filtered.slice((page - 1) * READINGS_PAGE_SIZE, page * READINGS_PAGE_SIZE);

  function Pagination({ total }: { total: number }) {
    const totalPages = Math.ceil(total / READINGS_PAGE_SIZE);
    if (totalPages <= 1) return null;
    const btnStyle = (disabled: boolean): React.CSSProperties => ({
      background: disabled ? "transparent" : "var(--bg-card)",
      border: "1px solid " + (disabled ? "var(--border-subtle)" : "var(--border)"),
      color: disabled ? "var(--text-dim)" : "var(--text-secondary)",
      borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600,
      cursor: disabled ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.12s",
    });
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "14px 16px", borderTop: "1px solid var(--border-subtle)" }}>
        <button style={btnStyle(page === 1)} disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 120, textAlign: "center" }}>
          Page {page} of {totalPages} · {total} items
        </span>
        <button style={btnStyle(page === totalPages)} disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        padding: isMobile ? "10px 12px" : "10px 20px", flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 8,
      }}>

        {/* Single row — search + sort + filters toggle + actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search input — consistent across mobile/desktop */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "0 10px", height: 36,
          }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>🔍</span>
            <input
              className="search-input"
              placeholder="Search title, topic, type, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearch("")}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--text-bright)", fontSize: 13, fontFamily: "inherit",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: "transparent", border: "none", color: "var(--text-muted)",
                cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0,
              }}>✕</button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", borderRadius: 8, padding: "0 8px",
              height: 36, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}
          >
            <option value="newest">🕐 Newest</option>
            <option value="top">▲ Top</option>
            <option value="alpha">A→Z</option>
          </select>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: showFilters || activeFilterCount > 0 ? "#6366f122" : "var(--bg-card)",
              border: "1px solid " + (showFilters || activeFilterCount > 0 ? "#6366f1" : "var(--border)"),
              color: showFilters || activeFilterCount > 0 ? "var(--badge-indigo-tx)" : "var(--text-secondary)",
              borderRadius: 8, height: 36, padding: "0 12px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "all 0.15s",
            }}
          >
            <span>⚙</span>
            {!isMobile && <span>Filters</span>}
            {activeFilterCount > 0 && (
              <span style={{
                background: "#6366f1", color: "#fff", borderRadius: "50%",
                width: 16, height: 16, fontSize: 10, fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>{activeFilterCount}</span>
            )}
          </button>

          {/* Clear — only when filters active */}
          {hasFilters && (
            <button
              onClick={clearAll}
              style={{
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--text-muted)", borderRadius: 8, height: 36, padding: "0 10px",
                fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
              }}
            >
              Clear
            </button>
          )}

          {/* Publish */}
          <Link
            to={SUBMIT_PATH}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: "#6366f1", color: "#fff", borderRadius: 8, height: 36,
              padding: "0 14px", fontSize: 12, fontWeight: 600,
              textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            ＋ {isMobile ? "" : "Publish"}
          </Link>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 8,
            background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, padding: "10px 12px",
          }}>
            {/* Type chips */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Type</div>
              <div style={{
                display: "flex", gap: 5, flexWrap: "wrap",
              }}>
                {POST_TYPES.map((t) => {
                  const active = activeTypes.has(t);
                  return (
                    <button key={t} onClick={() => toggleType(t)} style={{
                      background: active ? "#6366f1" : "transparent",
                      border: "1px solid " + (active ? "#6366f1" : "var(--border)"),
                      color: active ? "#fff" : "var(--text-secondary)",
                      borderRadius: 20, padding: "4px 11px", fontSize: 11, cursor: "pointer",
                      fontFamily: "inherit", fontWeight: active ? 600 : 400, transition: "all 0.12s",
                      whiteSpace: "nowrap",
                    }}>
                      {TYPE_ICONS[t] || "📌"} {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level + Topic on same row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Level</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {DIFFICULTIES.map((d) => {
                    const active = activeDiff === d;
                    const ds = DIFF_STYLE[d] || { bg: "transparent", tx: "var(--text-muted)" };
                    return (
                      <button key={d} onClick={() => setActiveDiff(active ? "" : d)} style={{
                        background: active ? ds.bg : "transparent",
                        border: "1px solid " + (active ? ds.tx + "66" : "var(--border-subtle)"),
                        color: active ? ds.tx : "var(--text-muted)",
                        borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer",
                        fontFamily: "inherit", fontWeight: active ? 700 : 400, transition: "all 0.12s",
                        whiteSpace: "nowrap",
                      }}>{d}</button>
                    );
                  })}
                </div>
              </div>

              {topics.length > 0 && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Topic</div>
                  <div style={{
                    display: "flex", gap: 5, flexWrap: "wrap",
                    maxHeight: 72, overflowY: "auto",
                  }}>
                    {topics.map((t) => {
                      const active = activeTopic === t;
                      return (
                        <button key={t} onClick={() => setActiveTopic(active ? "" : t)} style={{
                          background: active ? "#0ea5e922" : "transparent",
                          border: "1px solid " + (active ? "#0ea5e9" : "var(--border-subtle)"),
                          color: active ? "#0ea5e9" : "var(--text-muted)",
                          borderRadius: 6, padding: "3px 9px", fontSize: 10, cursor: "pointer",
                          fontFamily: "inherit", fontWeight: active ? 700 : 400, transition: "all 0.12s",
                          whiteSpace: "nowrap",
                        }}>#{t}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Result count bar ─────────────────────────────────────────── */}
      <div style={{
        padding: "7px 20px", fontSize: 11, color: "var(--text-muted)",
        background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{filtered.length} of {allReadings.length} readings</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          Approved community submissions only
        </span>
      </div>

      {/* ── Table / Card list ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 56, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading readings…</div>
        ) : fetchError ? (
          <div style={{ padding: 56, textAlign: "center", color: "#f87171", fontSize: 13 }}>Failed to load readings: {fetchError}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No readings match your filters.
          </div>
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {pagedReadings.map((r) => <ReadingCard key={r.id} r={r} myVotes={myVotes} toggleVote={toggleVote} />)}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", minWidth: 800,
              borderCollapse: "separate", borderSpacing: "0 3px",
              fontSize: 12, padding: "8px 12px",
            }}>
              <colgroup>
                <col style={{ width: 52 }} />
                <col style={{ width: 106 }} />
                <col style={{ width: 230 }} />
                <col style={{ width: 92 }} />
                <col style={{ width: 116 }} />
                <col style={{ width: 162 }} />
                <col style={{ width: 64 }} />
              </colgroup>
              <thead>
                <tr>
                  {(["♡", "Type", "Title / Link", "Level", "Added By", "Topics", "Date"] as string[]).map((h, i) => (
                    <th key={h} style={{
                      padding: i === 0 ? "10px 6px 8px" : "10px 14px 8px",
                      textAlign: i === 0 ? "center" : "left",
                      fontSize: 9, fontWeight: 700, letterSpacing: 1.4,
                      textTransform: "uppercase", color: "var(--text-muted)",
                      whiteSpace: "nowrap", background: "transparent",
                      borderBottom: "2px solid var(--border)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedReadings.map((r, idx) => (
                  <TableRow key={r.id} r={r} idx={idx} myVotes={myVotes} toggleVote={toggleVote} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination total={filtered.length} />

        {/* ── Contribute footer ── */}
        <div style={{ padding: "28px 20px", textAlign: "center", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
            Know a great resource? Submit it directly — admins review every entry before it appears here.
          </div>
          <Link to={SUBMIT_PATH} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "1px solid #6366f1", color: "#a5b4fc",
            borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            ＋ Publish a reading
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Desktop table row ──────────────────────────────────────────────────────────
function TableRow({ r, idx, myVotes, toggleVote }: {
  r: Reading; idx: number; myVotes: Set<string>; toggleVote: (id: string) => void;
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
              fontSize: 9, color: "#38bdf8", background: "#0ea5e911",
              border: "1px solid #0ea5e922", borderRadius: 4, padding: "2px 7px",
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

// ── Mobile card ────────────────────────────────────────────────────────────────
function ReadingCard({ r, myVotes, toggleVote }: {
  r: Reading; myVotes: Set<string>; toggleVote: (id: string) => void;
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
            <span key={t} style={{ fontSize: 9, color: "#0ea5e9", background: "#0ea5e922", border: "1px solid #0ea5e933", borderRadius: 4, padding: "1px 5px" }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
