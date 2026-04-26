// ── INTERVIEW TAB ─────────────────────────────────────────────────────────────
// Two sections toggled by a sub-tab:
//   💬 Experiences — real interview experience posts (YouTube, LinkedIn, blogs…)
//   ❓ Q&A         — practice questions with hints + community answer docs
//
// Both support search, filters, and save-to-browser (♡/♥ bookmarks).

import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CATEGORIES, COMPANIES,
  EXP_PLATFORMS, EXP_OUTCOMES,
} from "../data/interviews";
import type { InterviewQ, InterviewExp, ExpPlatform, ExpOutcome } from "../data/interviews";
import { apiFetch } from "../api/client";
import { buildInterviewsUrl, buildExperiencesUrl } from "../api/interviews";
import { useAuth } from "../lib/auth";
import { useMyInteractions } from "../hooks/useMyInteractions";

const SUBMIT_QA_PATH   = "/app/interview/submit";
const SUBMIT_EXP_PATH  = "/app/experiences/submit";

// ── Colour / icon maps ────────────────────────────────────────────────────────
const DIFF_COLOR: Record<string, { tx: string; bg: string }> = {
  Easy:   { tx: "#4ade80", bg: "#052e1644" },
  Medium: { tx: "#fbbf24", bg: "#78350f33" },
  Hard:   { tx: "#f87171", bg: "#450a0a44" },
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

const PLATFORM_ICON: Record<ExpPlatform, string> = {
  YouTube: "▶️", LinkedIn: "💼", Blog: "✍️", Medium: "✒️",
  Reddit: "🟠", "Dev.to": "👩‍💻", Blind: "👁️", Twitter: "🐦",
  Discord: "💬", Other: "🌐",
};

const OUTCOME_STYLE: Record<ExpOutcome, { tx: string; bg: string }> = {
  Offer:    { tx: "#4ade80", bg: "#052e1644" },
  Rejected: { tx: "#f87171", bg: "#450a0a44" },
  Ongoing:  { tx: "#fbbf24", bg: "#78350f33" },
  Unknown:  { tx: "#94a3b8", bg: "#1e293b44" },
};

type QASort  = "difficulty" | "newest" | "alpha";
type ExpSort = "top" | "newest" | "alpha";

// ── Pagination component ──────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? "transparent" : "var(--bg-card)",
    border: "1px solid " + (disabled ? "var(--border-subtle)" : "var(--border)"),
    color: disabled ? "var(--text-dim)" : "var(--text-secondary)",
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

// ── Main component ────────────────────────────────────────────────────────────
export function InterviewTab({ isMobile }: { isMobile: boolean }) {
  const [section, setSection] = useState<"experiences" | "qa">("experiences");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Sub-tab switcher */}
      <div style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        padding: "10px 20px 0", display: "flex", gap: 0, flexShrink: 0,
      }}>
        {([
          { id: "experiences", label: "💬 Experiences" },
          { id: "qa",          label: "❓ Q & A" },
        ] as { id: "experiences" | "qa"; label: string }[]).map((s) => {
          const active = section === s.id;
          return (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              background: "transparent", border: "none",
              borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
              color: active ? "#a5b4fc" : "var(--text-muted)",
              padding: "6px 18px 10px", fontSize: 13, fontWeight: active ? 700 : 400,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>
              {s.label}
            </button>
          );
        })}
      </div>

      {section === "experiences"
        ? <ExperiencesSection isMobile={isMobile} />
        : <QASection isMobile={isMobile} />
      }
    </div>
  );
}

// ══ EXPERIENCES SECTION ═══════════════════════════════════════════════════════
const EXP_PAGE_SIZE = 8;

function ExperiencesSection({ isMobile }: { isMobile: boolean }) {
  const [search,        setSearch]        = useState("");
  const [activePlat,    setActivePlat]    = useState<ExpPlatform | "">("");
  const [activeComp,    setActiveComp]    = useState("");
  const [activeOutcome, setActiveOutcome] = useState<ExpOutcome | "">("");
  const [sort,          setSort]          = useState<ExpSort>("newest");
  const [page,          setPage]          = useState(1);
  const [showFilters,   setShowFilters]   = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: interactions, toggleExperienceUpvote } = useMyInteractions();
  const myVotes = interactions.expUpvotes;

  // ── API fetch ────────────────────────────────────────────────────────
  const expApiUrl = buildExperiencesUrl({ sort, limit: 200 });
  const { data: expResp, isLoading: expLoading, error: expErr } = useQuery({
    queryKey: ["experiences", sort],
    queryFn:  () => apiFetch<{ data: InterviewExp[]; page: number; limit: number }>(expApiUrl),
  });
  const expError = expErr instanceof Error ? expErr.message : null;
  const allExperiences = expResp?.data ?? [];

  const toggleVote = useCallback((id: string) => {
    if (!user) {
      navigate("/sign-in?next=/app/interview");
      return;
    }
    const isOn = !myVotes.has(id);
    toggleExperienceUpvote.mutate({ id, on: isOn });
  }, [user, myVotes, toggleExperienceUpvote, navigate]);

  const companies = useMemo(() => {
    const s = new Set<string>();
    allExperiences.forEach((e) => s.add(e.company));
    return [...s].sort();
  }, [allExperiences]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let res = allExperiences.filter((e) => {
      if (activePlat    && e.platform !== activePlat)    return false;
      if (activeComp    && e.company  !== activeComp)    return false;
      if (activeOutcome && e.outcome  !== activeOutcome) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.topics.some((t) => t.includes(q)) ||
        (e.notes || "").toLowerCase().includes(q)
      );
    });
    if (sort === "top")    res = [...res].sort((a, b) => b.upvotes - a.upvotes);
    if (sort === "newest") res = [...res].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "alpha")  res = [...res].sort((a, b) => a.title.localeCompare(b.title));
    return res;
  }, [search, activePlat, activeComp, activeOutcome, sort, allExperiences]);

  const activeFilterCount = (activePlat ? 1 : 0) + (activeComp ? 1 : 0) + (activeOutcome ? 1 : 0);
  const hasFilters = !!(search || activePlat || activeComp || activeOutcome);

  function clearAll() { setSearch(""); setActivePlat(""); setActiveComp(""); setActiveOutcome(""); }

  // Reset to page 1 when filters change
  React.useEffect(() => { setPage(1); }, [search, activePlat, activeComp, activeOutcome, sort]);

  const pagedExp = filtered.slice((page - 1) * EXP_PAGE_SIZE, page * EXP_PAGE_SIZE);

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
              placeholder="Search company, role, topic…"
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
          <select value={sort} onChange={(e) => setSort(e.target.value as ExpSort)} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", borderRadius: 8, height: 36, padding: "0 8px",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
          }}>
            <option value="newest">🕐 Newest</option>
            <option value="top">♥ Top</option>
            <option value="alpha">A→Z</option>
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: showFilters || activeFilterCount > 0 ? "#6366f122" : "var(--bg-card)",
              border: "1px solid " + (showFilters || activeFilterCount > 0 ? "#6366f1" : "var(--border)"),
              color: showFilters || activeFilterCount > 0 ? "#a5b4fc" : "var(--text-secondary)",
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
          <Link to={SUBMIT_EXP_PATH} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "#6366f1", color: "#fff", borderRadius: 8, height: 36,
            padding: "0 14px", fontSize: 12, fontWeight: 600,
            textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            ＋ {isMobile ? "" : "Share"}
          </Link>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div style={{
            display: "flex", flexDirection: "column", gap: 8,
            background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
            borderRadius: 10, padding: "10px 12px",
          }}>
            {/* Platform */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Platform</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {EXP_PLATFORMS.map((p) => {
                  const active = activePlat === p;
                  return (
                    <button key={p} onClick={() => setActivePlat(active ? "" : p)} style={{
                      background: active ? "#6366f1" : "transparent",
                      border: "1px solid " + (active ? "#6366f1" : "var(--border)"),
                      color: active ? "#fff" : "var(--text-secondary)",
                      borderRadius: 20, padding: "4px 11px", fontSize: 11,
                      cursor: "pointer", fontFamily: "inherit",
                      fontWeight: active ? 600 : 400, transition: "all 0.12s", whiteSpace: "nowrap",
                    }}>
                      {PLATFORM_ICON[p]} {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
              {/* Outcome */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Outcome</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {EXP_OUTCOMES.map((o) => {
                    const active = activeOutcome === o;
                    const os = OUTCOME_STYLE[o];
                    return (
                      <button key={o} onClick={() => setActiveOutcome(active ? "" : o)} style={{
                        background: active ? os.bg : "transparent",
                        border: "1px solid " + (active ? os.tx + "66" : "var(--border-subtle)"),
                        color: active ? os.tx : "var(--text-muted)",
                        borderRadius: 6, padding: "4px 12px", fontSize: 11,
                        cursor: "pointer", fontFamily: "inherit",
                        fontWeight: active ? 700 : 400, transition: "all 0.12s", whiteSpace: "nowrap",
                      }}>{o}</button>
                    );
                  })}
                </div>
              </div>

              {/* Company */}
              {companies.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Company</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {companies.map((c) => {
                      const active = activeComp === c;
                      return (
                        <button key={c} onClick={() => setActiveComp(active ? "" : c)} style={{
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
              )}
            </div>
          </div>
        )}
      </div>

      {/* Count bar */}
      <div style={{
        padding: "7px 20px", fontSize: 11, color: "var(--text-muted)",
        background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)",
        flexShrink: 0, display: "flex", justifyContent: "space-between",
      }}>
        <span>{filtered.length} of {allExperiences.length} experiences</span>
        <span style={{ fontSize: 10, color: "var(--text-dim)" }}>save to bookmark · count reflects community rating</span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {expLoading ? (
          <div style={{ padding: 56, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading experiences…</div>
        ) : expError ? (
          <div style={{ padding: 56, textAlign: "center", color: "#f87171", fontSize: 13 }}>Failed to load experiences: {expError}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            No experiences match your filters.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px" }}>
            {pagedExp.map((e) => (
              <ExperienceCard key={e.id} e={e} myVotes={myVotes} toggleVote={toggleVote} isMobile={isMobile} />
            ))}
          </div>
        )}
        <Pagination page={page} total={filtered.length} pageSize={EXP_PAGE_SIZE} onChange={setPage} />

        {/* Footer */}
        <div style={{ padding: "24px 20px", textAlign: "center", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
            Went through an interview recently? Share your experience — it helps others prepare.
          </div>
          <Link to={SUBMIT_EXP_PATH}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "transparent", border: "1px solid #6366f1", color: "#a5b4fc",
              borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#6366f115")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            💬 Share Your Experience
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Experience card ───────────────────────────────────────────────────────────
function ExperienceCard({ e, myVotes, toggleVote, isMobile }: {
  e: InterviewExp; myVotes: Set<string>;
  toggleVote: (id: string) => void; isMobile: boolean;
}) {
  const voted = myVotes.has(e.id);
  const os    = e.outcome ? OUTCOME_STYLE[e.outcome] : null;

  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "14px 12px", borderRadius: 10,
      background: "var(--bg-panel)", border: "1px solid var(--border-subtle)",
    }}>
      {/* Save button */}
      <button
        onClick={() => toggleVote(e.id)}
        title={voted ? "You upvoted this — click to remove" : "Upvote (sign in required)"}
        style={{
          flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          background: voted ? "#6366f118" : "transparent",
          border: "1px solid " + (voted ? "#818cf8" : "var(--border)"),
          color: voted ? "#818cf8" : "var(--text-muted)",
          borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit", minWidth: 40, transition: "all 0.15s", marginTop: 2,
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>{voted ? "♥" : "♡"}</span>
        <span>{e.upvotes}</span>
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Tags row */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6, alignItems: "center" }}>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "var(--text-secondary)",
            background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
            borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap",
          }}>
            {PLATFORM_ICON[e.platform]} {e.platform}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "var(--text-secondary)",
            background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
            borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap",
          }}>
            {COMPANY_LOGOS[e.company] || "🏢"} {e.company}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 4, padding: "2px 8px" }}>
            {e.role}
          </span>
          {e.outcome && os && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: os.tx, background: os.bg,
              border: "1px solid " + os.tx + "44", borderRadius: 4, padding: "2px 8px",
            }}>
              {e.outcome}
            </span>
          )}
          <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: "auto" }}>
            {(e.createdAt ?? "").slice(0, 7)}
          </span>
        </div>

        {/* Title link */}
        <a
          href={e.url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: "var(--text-bright)", textDecoration: "none", lineHeight: 1.4, display: "block", marginBottom: 4 }}
          onMouseEnter={(ev) => (ev.currentTarget.style.color = "#818cf8")}
          onMouseLeave={(ev) => (ev.currentTarget.style.color = "var(--text-bright)")}
        >
          {e.title} <span style={{ fontSize: 10, opacity: 0.5 }}>↗</span>
        </a>

        {e.notes && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.5 }}>{e.notes}</div>
        )}

        {/* Topics + author */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {e.githubUser ? (
            <a
              href={"https://github.com/" + e.githubUser} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none", color: "var(--text-secondary)", fontSize: 10, marginRight: 4 }}
            >
              <img src={"https://github.com/" + e.githubUser + ".png?size=16"} alt={e.addedBy} style={{ width: 14, height: 14, borderRadius: "50%" }} />
              {e.addedBy}
            </a>
          ) : (
            <span style={{ fontSize: 10, color: "var(--text-secondary)", marginRight: 4 }}>by {e.addedBy}</span>
          )}
          {e.topics.slice(0, 5).map((t) => (
            <span key={t} style={{ fontSize: 9, color: "#38bdf8", background: "#0ea5e911", border: "1px solid #0ea5e922", borderRadius: 4, padding: "1px 5px" }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const QA_PAGE_SIZE = 10;

// ══ Q&A SECTION ═══════════════════════════════════════════════════════════════
function QASection({ isMobile }: { isMobile: boolean }) {
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

  // ── API fetch ────────────────────────────────────────────────────────
  const qaApiUrl = buildInterviewsUrl({ sort, limit: 200 });
  const { data: qaResp, isLoading: qaLoading, error: qaErr } = useQuery({
    queryKey: ["interviews", sort],
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
              color: showFilters || activeFilterCount > 0 ? "#a5b4fc" : "var(--text-secondary)",
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
  q, isPracticed, isExpanded, togglePracticed, toggleExpanded, isMobile,
}: {
  q: InterviewQ; isPracticed: boolean; isExpanded: boolean;
  togglePracticed: (id: string) => void; toggleExpanded: (id: string) => void; isMobile: boolean;
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
              <span style={{ fontSize: 10, color: "#4ade80", background: "#052e1633", border: "1px solid #4ade8033", borderRadius: 4, padding: "1px 7px" }}>
                {q.answerDocs.length} answer{q.answerDocs.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {/* Topics row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {q.topics.slice(0, 5).map((t) => (
              <span key={t} style={{ fontSize: 9, color: "#38bdf8", background: "#0ea5e911", border: "1px solid #0ea5e922", borderRadius: 4, padding: "1px 6px" }}>
                #{t}
              </span>
            ))}
            {q.topics.length > 5 && <span style={{ fontSize: 9, color: "var(--text-muted)" }}>+{q.topics.length - 5}</span>}
          </div>
        </div>

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
