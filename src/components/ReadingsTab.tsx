// ── READINGS TAB ──────────────────────────────────────────────────────────────
// Community-curated resources, contributed via GitHub PRs.
// Filters: type · difficulty · topic · search. Sort: newest / top / A-Z.
// Upvotes: base count in readings.ts + one local browser vote per entry.

import React, { useState, useMemo, useCallback } from "react";
import { POST_TYPES, DIFFICULTIES } from "../data/readings";
import type { Reading } from "../data/readings";
import { loadSet, saveSet } from "../utils/localStorage";
import { useFetch } from "../hooks/useFetch";
import { buildReadingsUrl } from "../api/readings";

const REPO     = "pavan-gattupalli-savii/system-design-python-roadmap";
const PR_URL   = `https://github.com/${REPO}/compare`;
const FILE_URL = `https://github.com/${REPO}/blob/main/src/data/readings.ts`;
const VOTE_KEY = "sd_my_votes_v1";

// Pre-filled issue body — always works via GitHub's ?body= parameter
const _ISSUE_BODY = encodeURIComponent([
  "## 📖 Reading Suggestion",
  "",
  "**Title**",
  "<!-- Short human-readable title for the resource -->",
  "",
  "**URL**",
  "<!-- Full https:// link -->",
  "",
  "**Type**",
  "<!-- Pick one: Blog · YouTube · LinkedIn · Book · Paper · Course · Newsletter · Thread · Docs · Website · Podcast · Tool · Repo · Slide · Case Study -->",
  "",
  "**Difficulty**",
  "<!-- Pick one: Beginner · Intermediate · Advanced -->",
  "",
  "**Topics / Tags**",
  "<!-- Comma-separated lowercase kebab-case, e.g. `caching, redis, rate-limiting` -->",
  "",
  "**Your Name (Added By)**",
  "",
  "**Your GitHub Username** _(optional — used for avatar + profile link)_",
  "",
  "**Why it's useful** _(optional, one line)_",
  "",
  "---",
  "",
  "## Checklist",
  "- [ ] Resource is publicly accessible",
  "- [ ] URL is correct and working",
  "- [ ] Topics are lowercase kebab-case",
  "- [ ] Not a duplicate — I checked `src/data/readings.ts`",
].join("\n"));
const ISSUE_URL = `https://github.com/${REPO}/issues/new?labels=reading-suggestion&title=%5BReading%5D+&body=${_ISSUE_BODY}`;

// ── Icon + colour maps ────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string, string> = {
  Blog: "✍️", YouTube: "▶️", LinkedIn: "💼", Book: "📖", Paper: "📄",
  Course: "🎓", Newsletter: "📬", Thread: "🧵", Docs: "📘", Website: "🌐",
  Podcast: "🎙️", Tool: "🔧", Repo: "⭐", Slide: "🖥️", "Case Study": "🔬",
};

const DIFF_STYLE: Record<string, { bg: string; tx: string }> = {
  Beginner:     { bg: "#052e1644", tx: "#4ade80" },
  Intermediate: { bg: "#78350f33", tx: "#fbbf24" },
  Advanced:     { bg: "#312e8133", tx: "#a5b4fc" },
};

type SortKey = "newest" | "top" | "alpha";

function allTopics(rs: Reading[]): string[] {
  const s = new Set<string>();
  rs.forEach((r) => r.topics.forEach((t) => s.add(t)));
  return [...s].sort();
}

// ── Main component ────────────────────────────────────────────────────────────
export function ReadingsTab({ isMobile }: { isMobile: boolean }) {
  const [search,      setSearch]      = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [activeDiff,  setActiveDiff]  = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [sort,        setSort]        = useState<SortKey>("top");
  const [myVotes, setMyVotes] = useState<Set<number>>(() => loadSet(VOTE_KEY));

  // ── API fetch ─────────────────────────────────────────────────────────────
  const apiUrl = buildReadingsUrl({ sort, limit: 200 });
  const { data: apiResp, loading, error: fetchError } = useFetch<{ data: Reading[]; page: number; limit: number }>(apiUrl);
  const allReadings = apiResp?.data ?? [];

  const topics = useMemo(() => allTopics(allReadings), [allReadings]);

  const toggleVote = useCallback((id: number) => {
    setMyVotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveSet(VOTE_KEY, next);
      return next;
    });
  }, []);

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
    if (sort === "top")   res = [...res].sort((a, b) => (b.upvotes + (myVotes.has(b.id) ? 1 : 0)) - (a.upvotes + (myVotes.has(a.id) ? 1 : 0)));
    if (sort === "alpha") res = [...res].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "newest")res = [...res].sort((a, b) => b.addedOn.localeCompare(a.addedOn));
    return res;
  }, [search, activeTypes, activeDiff, activeTopic, sort, myVotes, allReadings]);

  const hasFilters = activeTypes.size > 0 || activeTopic || activeDiff || search;
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
        padding: isMobile ? "10px 12px" : "12px 20px", flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 10,
      }}>

        {/* Row 1 — Search + sort + actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>🔍</span>
          <input
            className="search-input"
            placeholder="Search title, author, tag, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearch("")}
            style={{ flex: 1 }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", borderRadius: 6, padding: "5px 8px",
              fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}
          >
            <option value="top">▲ Top</option>
            <option value="newest">🕐 Newest</option>
            <option value="alpha">A→Z</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setActiveTypes(new Set()); setActiveTopic(""); setActiveDiff(""); }}
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
            >
              Clear
            </button>
          )}
          <a
            href={ISSUE_URL} target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "#6366f1", color: "#fff", border: "none", borderRadius: 7,
              padding: isMobile ? "6px 10px" : "6px 14px", fontSize: isMobile ? 11 : 12,
              fontWeight: 600, textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            ＋ Suggest
          </a>
        </div>

        {/* Row 2 — Type chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {POST_TYPES.map((t) => {
            const active = activeTypes.has(t);
            return (
              <button key={t} onClick={() => toggleType(t)} style={{
                background: active ? "#6366f1" : "transparent",
                border: "1px solid " + (active ? "#6366f1" : "var(--border)"),
                color: active ? "#fff" : "var(--text-secondary)",
                borderRadius: 20, padding: "3px 10px", fontSize: 11, cursor: "pointer",
                fontFamily: "inherit", fontWeight: active ? 600 : 400, transition: "all 0.12s",
              }}>
                {TYPE_ICONS[t] || "📌"} {t}
              </button>
            );
          })}
        </div>

        {/* Row 3 — Difficulty + Topic filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>Level:</span>
          {DIFFICULTIES.map((d) => {
            const active = activeDiff === d;
            const ds = DIFF_STYLE[d] || { bg: "transparent", tx: "var(--text-muted)" };
            return (
              <button key={d} onClick={() => setActiveDiff(active ? "" : d)} style={{
                background: active ? ds.bg : "transparent",
                border: "1px solid " + (active ? ds.tx + "66" : "var(--border-subtle)"),
                color: active ? ds.tx : "var(--text-muted)",
                borderRadius: 4, padding: "2px 10px", fontSize: 10, cursor: "pointer",
                fontFamily: "inherit", fontWeight: active ? 700 : 400, transition: "all 0.12s",
              }}>{d}</button>
            );
          })}
          <span style={{ width: 1, height: 12, background: "var(--border-subtle)", margin: "0 4px", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", marginRight: 2 }}>Topic:</span>
          {topics.map((t) => {
            const active = activeTopic === t;
            return (
              <button key={t} onClick={() => setActiveTopic(active ? "" : t)} style={{
                background: active ? "#0ea5e922" : "transparent",
                border: "1px solid " + (active ? "#0ea5e9" : "var(--border-subtle)"),
                color: active ? "#0ea5e9" : "var(--text-muted)",
                borderRadius: 4, padding: "2px 8px", fontSize: 10, cursor: "pointer",
                fontFamily: "inherit", fontWeight: active ? 700 : 400, transition: "all 0.12s",
              }}>#{t}</button>
            );
          })}
        </div>
      </div>

      {/* ── Result count bar ─────────────────────────────────────────── */}
      <div style={{
        padding: "7px 20px", fontSize: 11, color: "var(--text-muted)",
        background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{filtered.length} of {allReadings.length} readings</span>
        <a href={FILE_URL} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 10, color: "var(--text-muted)", textDecoration: "none" }}>
          View source on GitHub →
        </a>
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
            Know a great resource? Contribute via GitHub — all reads are PR-reviewed.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <CtaLink href={ISSUE_URL}>🙋 Suggest via Issue</CtaLink>
            <CtaLink href={PR_URL}>🔀 Open a Pull Request</CtaLink>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Approved PRs appear here after merge. Add your GitHub username to get an avatar and profile link!
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CTA link ──────────────────────────────────────────────────────────────────
function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "transparent", border: "1px solid #6366f1", color: "#a5b4fc",
        borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600,
        textDecoration: "none", transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#6366f115")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </a>
  );
}

// ── Desktop table row ──────────────────────────────────────────────────────────
function TableRow({ r, idx, myVotes, toggleVote }: {
  r: Reading; idx: number; myVotes: Set<number>; toggleVote: (id: number) => void;
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
          title={voted ? "Saved in your browser — click to remove" : "Save this resource (stored locally in your browser)"}
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
        {r.addedOn.slice(0, 7)}
      </td>
    </tr>
  );
}

// ── Mobile card ────────────────────────────────────────────────────────────────
function ReadingCard({ r, myVotes, toggleVote }: {
  r: Reading; myVotes: Set<number>; toggleVote: (id: number) => void;
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
          title={voted ? "Saved in your browser — click to remove" : "Save this resource (stored locally in your browser)"}
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
            {r.addedOn.slice(0, 7)}
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
