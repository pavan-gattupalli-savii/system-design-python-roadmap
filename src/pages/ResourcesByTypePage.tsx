// ── Resources By Type Page ────────────────────────────────────────────────────
// Reached by clicking a resource-type chip on the Overview page.
// Flattens all roadmap resources of the given type and shows them in a table.

import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useRoadmap } from "../hooks/useRoadmap";
import { TYPES } from "../data/types";
import type { LayoutContext } from "../components/Layout";

interface FlatResource {
  phase:   number;
  week:    number;
  weekTitle: string;
  session: string;
  item:    string;
  where:   string;
  mins:    number;
  url?:    string;
}

type SortKey = "week" | "mins" | "item";

export default function ResourcesByTypePage() {
  const { type }   = useParams<{ type: string }>();
  const ctx        = useOutletContext<LayoutContext>();
  const { phases: roadmap } = useRoadmap(ctx.lang);
  const navigate   = useNavigate();
  const [sort, setSort] = useState<SortKey>("week");
  const [search, setSearch] = useState("");

  const tc = type ? TYPES[type] : undefined;

  // Flatten all resources of this type across every phase / week / session
  const allResources = useMemo<FlatResource[]>(() => {
    if (!type) return [];
    const out: FlatResource[] = [];
    roadmap.forEach((p) => {
      p.weeks.forEach((w) => {
        w.sessions.forEach((s) => {
          s.resources.forEach((r) => {
            if (r.type === type) {
              out.push({
                phase:     p.phase,
                week:      w.n,
                weekTitle: w.title,
                session:   s.focus,
                item:      r.item,
                where:     r.where,
                mins:      r.mins,
                url:       r.url,
              });
            }
          });
        });
      });
    });
    return out;
  }, [roadmap, type]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const res = q
      ? allResources.filter(
          (r) =>
            r.item.toLowerCase().includes(q) ||
            r.session.toLowerCase().includes(q) ||
            r.weekTitle.toLowerCase().includes(q) ||
            r.where.toLowerCase().includes(q),
        )
      : allResources;

    return [...res].sort((a, b) => {
      if (sort === "week")  return a.week  - b.week  || a.phase - b.phase;
      if (sort === "mins")  return b.mins  - a.mins;
      if (sort === "item")  return a.item.localeCompare(b.item);
      return 0;
    });
  }, [allResources, sort, search]);

  const totalMins = useMemo(() => filtered.reduce((s, r) => s + r.mins, 0), [filtered]);

  if (!tc) {
    return (
      <div style={{ flex: 1, display: "grid", placeItems: "center", flexDirection: "column", gap: 12, color: "var(--text-muted)", fontSize: 13 }}>
        <div>Unknown resource type "{type}".</div>
        <button onClick={() => navigate("/app/overview")} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 16px", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
          ← Back to Overview
        </button>
      </div>
    );
  }

  const isMobile = ctx.isMobile;

  // column base style
  const th = (minW?: number): React.CSSProperties => ({
    padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
    color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase",
    whiteSpace: "nowrap", borderBottom: "1px solid var(--border-subtle)",
    background: "var(--bg-secondary)",
    minWidth: minW,
  });
  const td: React.CSSProperties = {
    padding: "10px 14px", fontSize: 12, color: "var(--text-body)",
    borderBottom: "1px solid var(--border-subtle)", verticalAlign: "top",
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)",
        padding: isMobile ? "12px 14px" : "14px 28px", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/app/overview")}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 12px", fontSize: 12,
              color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            }}
          >
            ← Overview
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: tc.tx,
              background: tc.bg, border: "1px solid " + tc.tx + "30",
              borderRadius: 8, padding: "4px 12px",
            }}>
              {tc.icon} {type}
            </span>
            <div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3 }}>
                {type} Resources
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {allResources.length} total · {Math.round(totalMins / 60)}h {totalMins % 60}m estimated
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar — search + sort */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "0 10px", height: 34,
          }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>🔍</span>
            <input
              className="search-input"
              placeholder="Search resource, session, week…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearch("")}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--text-bright)", fontSize: 12, fontFamily: "inherit",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: 0 }}>✕</button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", borderRadius: 8, padding: "0 8px",
              height: 34, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}
          >
            <option value="week">📅 By Week</option>
            <option value="mins">⏱ By Duration</option>
            <option value="item">A→Z</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            {search ? `No results for "${search}"` : `No ${type} resources found.`}
          </div>
        ) : isMobile ? (
          /* ── Mobile: card list ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {filtered.map((r, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-bright)", flex: 1 }}>
                    {r.url
                      ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: tc.tx, textDecoration: "none" }}>{r.item} ↗</a>
                      : r.item}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{r.mins} min</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  Week {r.week} · {r.session}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{r.where}</div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Desktop: table ── */
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr>
                <th style={th(32)}>#</th>
                <th style={th()}>Resource</th>
                <th style={th(80)}>Week</th>
                <th style={th()}>Session</th>
                <th style={th()}>Where</th>
                <th style={{ ...th(80), textAlign: "right" }}>Duration</th>
                <th style={{ ...th(50), textAlign: "center" }}>Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={i}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.1s" }}
                >
                  <td style={{ ...td, color: "var(--text-muted)", fontSize: 11 }}>{i + 1}</td>
                  <td style={{ ...td, fontWeight: 600, color: "var(--text-bright)", maxWidth: 380 }}>
                    {r.url
                      ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: tc.tx, textDecoration: "none" }}
                          onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = "underline")}
                          onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = "none")}
                        >{r.item}</a>
                      : r.item}
                  </td>
                  <td style={td}>
                    <Link
                      to={`/app/roadmap/phase/${r.phase}/week/${r.week}`}
                      style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: 11 }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-bright)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-secondary)")}
                    >
                      W{r.week}
                    </Link>
                  </td>
                  <td style={{ ...td, color: "var(--text-secondary)", maxWidth: 220 }}>{r.session}</td>
                  <td style={{ ...td, color: "var(--text-muted)", fontSize: 11 }}>{r.where}</td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap", color: "var(--text-secondary)" }}>{r.mins} min</td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {r.url
                      ? <a href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ color: tc.tx, fontSize: 14, textDecoration: "none" }}
                          title="Open resource"
                        >↗</a>
                      : <span style={{ color: "var(--text-muted)", fontSize: 11 }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
                  {filtered.length} resource{filtered.length !== 1 ? "s" : ""}{search ? " matched" : ""}
                </td>
                <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {Math.round(totalMins / 60)}h {totalMins % 60}m total
                </td>
                <td style={{ borderTop: "1px solid var(--border-subtle)" }} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
