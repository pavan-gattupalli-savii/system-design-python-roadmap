// ── INTERVIEW QA SECTION ──────────────────────────────────────────────────────
// Practice questions with hints + community answer docs. Split out of
// InterviewTab so the ~20 KB of QA UI loads lazily only when the user clicks
// the "❓ Q & A" sub-tab (default tab is "💬 Experiences").

import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES, COMPANIES } from "../data/interviews";
import type { InterviewQ } from "../data/interviews";
import { apiFetch } from "../api/client";
import { buildInterviewsUrl } from "../api/interviews";
import { useAuth } from "../lib/auth";
import { useMyInteractions } from "../hooks/useMyInteractions";
import { useBookmarks } from "../hooks/useBookmarks";
import { qk } from "../lib/queryKeys";

const SUBMIT_QA_PATH = "/app/interview/submit";
const QA_PAGE_SIZE = 10;

const DIFF_COLOR: Record<string, { tx: string; bg: string }> = {
  Easy:   { tx: "var(--badge-green-tx)", bg: "var(--badge-green-bg)" },
  Medium: { tx: "var(--badge-amber-tx)", bg: "var(--badge-amber-bg)" },
  Hard:   { tx: "var(--badge-red-tx)",   bg: "var(--badge-red-bg)"   },
};

const CAT_ICON: Record<string, string> = {
  "System Design": "🏗️",
  "Behavioral":    "🧠",
  "Databases":     "🗄️",
  "Networking":    "🌐",
  "Concepts":      "💡",
  "Architecture":  "📐",
};

const COMPANY_LOGOS: Record<string, string> = {
  Amazon: "🟠", Google: "🔵", Meta: "🔷", Microsoft: "🪟",
  Apple: "🍎", Netflix: "🔴", Uber: "⚫", Airbnb: "🌸",
  Twitter: "🐦", LinkedIn: "💼", Stripe: "💜", Shopify: "🟢",
  Atlassian: "🔹", Oracle: "🔶", ByteDance: "🎵",
};

type QASort = "difficulty" | "newest" | "alpha";

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const btnStyle = (disabled: boolean) => ({
    background: disabled ? "var(--bg-card)" : "#6366f1",
    color: disabled ? "var(--text-muted)" : "#fff",
    border: "none",
    borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600,
    cursor: disabled ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.12s",
  });
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "14px 16px", borderTop: "1px solid var(--border-subtle)", marginTop: 4 }}>
      <button style={btnStyle(page === 1)} disabled={page === 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 120, textAlign: "center" }}>
        Page {page} of {totalPages} · {total} items
      </span>
      <button style={btnStyle(page === totalPages)} disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}

export default function InterviewQASection({ isMobile }: { isMobile: boolean }) {
  const [search,        setSearch]        = useState("");
  const [activecat,     setActiveCat]     = useState("");
  const [activeDiff,    setActiveDiff]    = useState("");
  const [activeCompany, setActiveCompany] = useState("");
  const [sort,          setSort]          = useState<QASort>("newest");
  const [expanded,      setExpanded]      = useState<Set<string>>(new Set());
  const [page,          setPage]          = useState(1);
  const [showFilters,   setShowFilters]   = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: interactions, togglePracticed: togglePracticedMutation } = useMyInteractions();
  const practiced = interactions.practiced;
  const { bookmarks, toggleBookmark } = useBookmarks();
  const myQBookmarks = bookmarks.question;

  // ── API fetch ────────────────────────────────────────────────────────
  const qaApiUrl = buildInterviewsUrl({ sort, limit: 200 });
  const { data: qaResp, isLoading: qaLoading, error: qaErr } = useQuery({
    queryKey: qk.interviewsList(sort),
    queryFn:  () => apiFetch<{ data: InterviewQ[]; page: number; limit: number }>(qaApiUrl),
  });
  const qaError = qaErr instanceof Error ? qaErr.message : null;
  const allInterviews = qaResp?.data ?? [];

  const togglePracticed = useCallback((id: string) => {
    if (!user) {
      navigate("/sign-in?next=/app/interview");
      return;
    }
    const isOn = !practiced.has(id);
    togglePracticedMutation.mutate({ id, on: isOn });
  }, [user, practiced, togglePracticedMutation, navigate]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 } as const;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let res = allInterviews.filter((r) => {
      if (activecat     && r.category !== activecat)              return false;
      if (activeDiff    && r.difficulty !== activeDiff)           return false;
      if (activeCompany && !r.companies.includes(activeCompany))  return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.topics.some((t) => t.includes(q)) ||
        r.companies.some((c) => c.toLowerCase().includes(q)) ||
        r.hints.some((h) => h.toLowerCase().includes(q))
      );
    });
    if (sort === "difficulty") res = [...res].sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
    if (sort === "newest")     res = [...res].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "alpha")      res = [...res].sort((a, b) => a.title.localeCompare(b.title));
    return res;
  }, [search, activecat, activeDiff, activeCompany, sort, allInterviews]);

  const activeFilterCount = (activecat ? 1 : 0) + (activeDiff ? 1 : 0) + (activeCompany ? 1 : 0);
  const hasFilters     = !!(search || activecat || activeDiff || activeCompany);
  const practicedCount = filtered.filter((q) => practiced.has(q.id)).length;

  function clearAll() { setSearch(""); setActiveCat(""); setActiveDiff(""); setActiveCompany(""); }

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [search, activecat, activeDiff, activeCompany, sort]);

  const pagedQA = filtered.slice((page - 1) * QA_PAGE_SIZE, page * QA_PAGE_SIZE);

  return (
    <>
      {/* Toolbar */}
      <div style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        padding: isMobile ? "10px 12px" : "10px 20px", flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {/* Single row */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "0 10px", height: 36,
          }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>🔍</span>
            <input
              className="search-input"
              placeholder="Search question, topic, company…"
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
          <select value={sort} onChange={(e) => setSort(e.target.value as QASort)} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", borderRadius: 8, height: 36, padding: "0 8px",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
          }}>
            <option value="difficulty">📶 Difficulty</option>
            <option value="newest">🕐 Newest</option>
            <option value="alpha">A→Z</option>
          </select>
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
          {hasFilters && (
            <button onClick={clearAll} style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", borderRadius: 8, height: 36, padding: "0 10px",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}>Clear</button>
          )}
          <Link to={SUBMIT_QA_PATH} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "#6366f1", color: "#fff", borderRadius: 8, height: 36,
            padding: "0 14px", fontSize: 12, fontWeight: 600,
            textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
          }}>
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
            {/* Category */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Category</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(CATEGORIES as readonly string[]).map((c) => {
                  const active = activecat === c;
                  return (
                    <button key={c} onClick={() => setActiveCat(active ? "" : c)} style={{
                      background: active ? "#6366f1" : "transparent",
                      border: "1px solid " + (active ? "#6366f1" : "var(--border)"),
                      color: active ? "#fff" : "var(--text-secondary)",
                      borderRadius: 20, padding: "4px 11px", fontSize: 11,
                      cursor: "pointer", fontFamily: "inherit",
                      fontWeight: active ? 600 : 400, transition: "all 0.12s", whiteSpace: "nowrap",
                    }}>
                      {CAT_ICON[c] || "🏷"} {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
              {/* Level */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Level</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {(["Easy", "Medium", "Hard"] as const).map((d) => {
                    const active = activeDiff === d;
                    const ds = DIFF_COLOR[d];
                    return (
                      <button key={d} onClick={() => setActiveDiff(active ? "" : d)} style={{
                        background: active ? ds.bg : "transparent",
                        border: "1px solid " + (active ? ds.tx + "66" : "var(--border-subtle)"),
                        color: active ? ds.tx : "var(--text-muted)",
                        borderRadius: 6, padding: "4px 12px", fontSize: 11,
                        cursor: "pointer", fontFamily: "inherit",
                        fontWeight: active ? 700 : 400, transition: "all 0.12s", whiteSpace: "nowrap",
                      }}>{d}</button>
                    );
                  })}
                </div>
              </div>

              {/* Company */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Company</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {(COMPANIES as readonly string[]).map((c) => {
                    const active = activeCompany === c;
                    return (
                      <button key={c} onClick={() => setActiveCompany(active ? "" : c)} style={{
                        background: active ? "#0ea5e922" : "transparent",
                        border: "1px solid " + (active ? "#0ea5e9" : "var(--border-subtle)"),
                        color: active ? "#0ea5e9" : "var(--text-muted)",
                        borderRadius: 6, padding: "4px 10px", fontSize: 11,
                        cursor: "pointer", fontFamily: "inherit",
                        fontWeight: active ? 700 : 400, transition: "all 0.12s", whiteSpace: "nowrap",
                      }}>
                        {COMPANY_LOGOS[c] || "🏢"} {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{
        padding: "7px 20px", fontSize: 11, color: "var(--text-muted)",
        background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0, display: "flex", justifyContent: "space-between",
      }}>
        <span>{filtered.length} of {allInterviews.length} questions</span>
        <span style={{ color: practicedCount > 0 ? "#4ade80" : "var(--text-muted)" }}>
          ✓ {practicedCount} practiced
        </span>
      </div>

      {/* Question list */}
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "10px 10px" : "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {qaLoading ? (
          <div style={{ padding: 56, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading questions…</div>
        ) : qaError ? (
          <div style={{ padding: 56, textAlign: "center", color: "#f87171", fontSize: 13 }}>Failed to load questions: {qaError}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No questions match your filters.
          </div>
        ) : (
          pagedQA.map((q) => (
            <QuestionCard
              key={q.id} q={q}
              isPracticed={practiced.has(q.id)}
              isExpanded={expanded.has(q.id)}
              togglePracticed={togglePracticed}
              toggleExpanded={toggleExpanded}
              isMobile={isMobile}
              isBookmarked={myQBookmarks.has(q.id)}
              toggleBookmark={(id) => toggleBookmark("question", id, "/app/interview")}
            />
          ))
        )}

        <Pagination page={page} total={filtered.length} pageSize={QA_PAGE_SIZE} onChange={setPage} />

        {/* Footer */}
        <div style={{ padding: "24px 16px", textAlign: "center", borderTop: "1px solid var(--border-subtle)", marginTop: 8 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
            Know a question that trips people up? Submit it directly — admins review every entry.
          </div>
          <Link to={SUBMIT_QA_PATH}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "transparent", border: "1px solid #6366f1", color: "#a5b4fc",
              borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6366f115")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            🙋 Suggest a Question
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Question card ─────────────────────────────────────────────────────────────
function QuestionCard({
  q, isPracticed, isExpanded, togglePracticed, toggleExpanded, isMobile, isBookmarked, toggleBookmark,
}: {
  q: InterviewQ; isPracticed: boolean; isExpanded: boolean;
  togglePracticed: (id: string) => void; toggleExpanded: (id: string) => void; isMobile: boolean;
  isBookmarked: boolean; toggleBookmark: (id: string) => void;
}) {
  const ds = DIFF_COLOR[q.difficulty];
  const answerSubmitPath = `/app/interview/${q.id}/answer`;

  return (
    <div style={{
      background: "var(--bg-panel)",
      border: "1px solid " + (isPracticed ? "#4ade8044" : "var(--border-subtle)"),
      borderLeft: "3px solid " + (isPracticed ? "#4ade80" : ds.tx),
      borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div onClick={() => toggleExpanded(q.id)} style={{
        padding: isMobile ? "12px 12px" : "13px 16px",
        cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        {/* Practice button */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePracticed(q.id); }}
          title={isPracticed ? "Mark as not practiced" : "Mark as practiced"}
          style={{
            flexShrink: 0, width: 28, height: 28,
            borderRadius: "50%", border: "2px solid " + (isPracticed ? "#4ade80" : "var(--border)"),
            background: isPracticed ? "#4ade8022" : "transparent",
            color: isPracticed ? "#4ade80" : "var(--text-muted)",
            cursor: "pointer", fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", marginTop: 2,
          }}
        >
          {isPracticed ? "✓" : ""}
        </button>

        {/* Question + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title first for better readability */}
          <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: "var(--text-bright)", lineHeight: 1.4, marginBottom: 8 }}>
            {q.title}
          </div>
          {/* Tags row below title */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: ds.tx, background: ds.bg,
              border: "1px solid " + ds.tx + "44", borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap",
            }}>
              {q.difficulty}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--text-secondary)",
              background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
              borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap",
            }}>
              {CAT_ICON[q.category]} {q.category}
            </span>
            {q.companies.slice(0, isMobile ? 2 : 4).map((c) => (
              <span key={c} style={{
                fontSize: 10, color: "var(--text-muted)", background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)", borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap",
              }}>
                {COMPANY_LOGOS[c]} {c}
              </span>
            ))}
            {q.companies.length > (isMobile ? 2 : 4) && (
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{q.companies.length - (isMobile ? 2 : 4)}</span>
            )}
            {q.answerDocs && q.answerDocs.length > 0 && (
              <span style={{ fontSize: 10, color: "var(--badge-green-tx)", background: "var(--badge-green-bg)", border: "1px solid var(--badge-green-tx)33", borderRadius: 4, padding: "1px 7px" }}>
                {q.answerDocs.length} answer{q.answerDocs.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {/* Topics row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {q.topics.slice(0, 5).map((t) => (
              <span key={t} style={{ fontSize: 9, color: "var(--badge-sky-tx)", background: "var(--badge-sky-bg)", border: "1px solid var(--badge-sky-border)", borderRadius: 4, padding: "1px 6px" }}>
                #{t}
              </span>
            ))}
            {q.topics.length > 5 && <span style={{ fontSize: 9, color: "var(--text-muted)" }}>+{q.topics.length - 5}</span>}
          </div>
        </div>

        {/* Bookmark star */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleBookmark(q.id); }}
          title={isBookmarked ? "Remove bookmark" : "Bookmark this question"}
          style={{
            flexShrink: 0, background: "transparent", border: "none",
            color: isBookmarked ? "#f59e0b" : "var(--text-secondary)",
            cursor: "pointer", fontSize: 17, padding: "4px", lineHeight: 1,
            marginTop: 2, transition: "color 0.15s",
          }}
        >
          {isBookmarked ? "★" : "☆"}
        </button>

        {/* Expand arrow */}
        <div style={{ flexShrink: 0, fontSize: 12, color: "var(--text-muted)", marginTop: 4, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
          ▼
        </div>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: isMobile ? "12px 12px 14px 52px" : "14px 16px 16px 56px",
          background: "var(--bg-page)",
        }}>
          {/* Hints */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
              Key points to cover
            </div>
            <ol style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 7 }}>
              {q.hints.map((h, i) => (
                <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{h}</li>
              ))}
            </ol>
          </div>

          {/* Follow-ups */}
          {q.followUps && q.followUps.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                Likely follow-ups
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                {q.followUps.map((f, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, fontStyle: "italic" }}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Community answer docs */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)" }}>
                Community Answers
              </div>
              <Link to={answerSubmitPath} style={{
                fontSize: 10, color: "#818cf8", textDecoration: "none", fontWeight: 600,
                border: "1px solid #6366f144", borderRadius: 4, padding: "2px 8px",
              }}>
                + Share yours
              </Link>
            </div>
            {q.answerDocs && q.answerDocs.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.answerDocs.map((doc, i) => (
                  <div key={doc.id ?? i} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--text-bright)", textDecoration: "none", fontWeight: 500 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#818cf8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-bright)")}
                    >
                      📄 {doc.label} ↗
                    </a>
                    <span style={{ fontSize: 10, color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      by
                      {doc.github ? (
                        <a
                          href={`https://github.com/${doc.github}`} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", textDecoration: "none" }}
                        >
                          <img
                            src={`https://github.com/${doc.github}.png?size=16`}
                            alt={doc.by}
                            style={{ width: 12, height: 12, borderRadius: "50%" }}
                          />
                          {doc.by}
                        </a>
                      ) : (
                        <span>{doc.by}</span>
                      )}
                      <span>·</span>
                      <span>{(doc.createdAt ?? "").slice(0, 7)}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>
                No community answers yet. Be the first — share a Google Doc or Gist!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
