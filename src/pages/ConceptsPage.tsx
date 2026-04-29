// ── ConceptsPage ──────────────────────────────────────────────────────────────
// Two-panel layout: sidebar category list (left) + concept article (right).
// All content is bundled — zero network requests.
// Route: /app/concepts   → shows list + first concept
//        /app/concepts/:slug → shows list + that concept

import { useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CONCEPTS, CONCEPTS_BY_SLUG, CONCEPT_CATEGORIES } from "../data/concepts/index";
import type { Concept, ConceptCategory, ConceptSection } from "../data/concepts/index";
import { ConceptDiagram } from "../components/concepts/ConceptDiagram";
import type { LayoutContext } from "../components/Layout";

// ── Category accent colours ───────────────────────────────────────────────────
const CAT_COLOR: Record<ConceptCategory, { bg: string; tx: string }> = {
  "Networking":         { bg: "#38bdf811", tx: "#38bdf8" },
  "LLD":                { bg: "#818cf811", tx: "#818cf8" },
  "Database":           { bg: "#34d39911", tx: "#34d399" },
  "Architecture":       { bg: "#fb923c11", tx: "#fb923c" },
  "Distributed Systems":{ bg: "#f472b611", tx: "#f472b6" },
};

// ── Callout component ─────────────────────────────────────────────────────────
function Callout({ kind, text }: { kind: "tip" | "note" | "warning"; text: string }) {
  const styles = {
    tip:     { bg: "#4ade8011", border: "#4ade8044", icon: "💡", tx: "#4ade80" },
    note:    { bg: "#38bdf811", border: "#38bdf844", icon: "ℹ️",  tx: "#38bdf8" },
    warning: { bg: "#fb923c11", border: "#fb923c44", icon: "⚠️", tx: "#fb923c" },
  }[kind];

  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      background: styles.bg, border: "1px solid " + styles.border,
      borderRadius: 8, padding: "12px 14px", margin: "16px 0", fontSize: 13,
      lineHeight: 1.6, color: "var(--text-secondary)",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{styles.icon}</span>
      <span>{text}</span>
    </div>
  );
}

// ── Data table component ──────────────────────────────────────────────────────
function ConceptTable({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 3px", fontSize: 12 }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{
                padding: "8px 14px", textAlign: "left",
                fontSize: 10, fontWeight: 700, letterSpacing: 1.1,
                textTransform: "uppercase", color: "var(--text-muted)",
                borderBottom: "2px solid var(--border)",
              }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "var(--bg-page)" : "var(--bg-panel)" }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "9px 14px",
                  color: j === 0 ? "var(--text-heading)" : "var(--text-secondary)",
                  fontWeight: j === 0 ? 600 : 400,
                  fontSize: j === 0 ? 13 : 12,
                  fontFamily: cell.includes("ns") || cell.includes("ms") || cell.includes("µs")
                    ? "monospace" : "inherit",
                  borderTop: "1px solid var(--border-subtle)",
                  borderBottom: "1px solid var(--border-subtle)",
                  lineHeight: 1.5,
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section renderer ──────────────────────────────────────────────────────────
function SectionBlock({ section }: { section: ConceptSection }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h3 style={{
        fontSize: 16, fontWeight: 700, color: "var(--text-heading)",
        margin: "0 0 12px", paddingBottom: 8,
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        {section.heading}
      </h3>

      {section.body && (
        <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-secondary)" }}>
          {section.body.split("\n\n").map((para, i) => (
            <p key={i} style={{ margin: "0 0 14px" }}>{para}</p>
          ))}
        </div>
      )}

      {section.callout && (
        <Callout kind={section.callout.kind} text={section.callout.text} />
      )}

      {section.diagram && (
        <ConceptDiagram id={section.diagram} />
      )}

      {section.bullets && (
        <ul style={{
          margin: "12px 0", paddingLeft: 20,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {section.bullets.map((b, i) => (
            <li key={i} style={{
              fontSize: 13, lineHeight: 1.65, color: "var(--text-secondary)",
            }}>
              {b}
            </li>
          ))}
        </ul>
      )}

      {section.table && (
        <ConceptTable cols={section.table.cols} rows={section.table.rows} />
      )}
    </section>
  );
}

// ── Concept article ───────────────────────────────────────────────────────────
function ConceptArticle({ concept, allConcepts }: { concept: Concept; allConcepts: Concept[] }) {
  const cc = CAT_COLOR[concept.category] ?? { bg: "transparent", tx: "var(--text-muted)" };
  const related = allConcepts.filter((c) => concept.related?.includes(c.slug));
  const navigate = useNavigate();

  return (
    <article style={{ padding: "32px 28px 48px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase",
            padding: "3px 10px", borderRadius: 20,
            background: cc.bg, color: cc.tx, border: "1px solid " + cc.tx + "44",
          }}>
            {concept.category}
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-heading)", margin: "0 0 8px", lineHeight: 1.2 }}>
          {concept.emoji} {concept.title}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          {concept.tagline}
        </p>
      </div>

      {/* Sections */}
      {concept.sections.map((s, i) => (
        <SectionBlock key={i} section={s} />
      ))}

      {/* Related concepts */}
      {related.length > 0 && (
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border-subtle)",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 12,
          }}>
            Related Concepts
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {related.map((r) => {
              const rc = CAT_COLOR[r.category] ?? { bg: "transparent", tx: "var(--accent)" };
              return (
                <button
                  key={r.slug}
                  onClick={() => navigate(`/app/concepts/${r.slug}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: rc.bg, border: "1px solid " + rc.tx + "44",
                    borderRadius: 8, padding: "8px 14px", cursor: "pointer",
                    color: "var(--text-heading)", fontSize: 13, fontWeight: 600,
                    fontFamily: "inherit", transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <span>{r.emoji}</span>
                  <span>{r.title}</span>
                  <span style={{ fontSize: 11, color: rc.tx }}>→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  active, search, onSearch,
}: {
  active: Concept | null;
  search: string;
  onSearch: (v: string) => void;
}) {
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!search) return CONCEPTS;
    const q = search.toLowerCase();
    return CONCEPTS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q) || c.category.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 0,
      borderRight: "1px solid var(--border-subtle)",
      width: 280, flexShrink: 0,
      overflowY: "auto",
    }}>
      {/* Search */}
      <div style={{ padding: "16px 16px 10px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--bg-secondary)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "6px 10px",
        }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search concepts…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: 12, color: "var(--text-heading)", fontFamily: "inherit",
            }}
          />
          {search && (
            <button onClick={() => onSearch("")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 14, lineHeight: 1, padding: 0,
            }}>✕</button>
          )}
        </div>
      </div>

      {/* Category groups */}
      {CONCEPT_CATEGORIES.map((cat) => {
        const items = filtered.filter((c) => c.category === cat);
        if (items.length === 0) return null;
        const cc = CAT_COLOR[cat] ?? { tx: "var(--text-muted)", bg: "transparent" };
        return (
          <div key={cat}>
            <div style={{
              padding: "10px 16px 4px",
              fontSize: 9, fontWeight: 700, letterSpacing: 1.3,
              textTransform: "uppercase", color: cc.tx,
            }}>
              {cat}
            </div>
            {items.map((c) => {
              const isActive = active?.slug === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => navigate(`/app/concepts/${c.slug}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", textAlign: "left",
                    background: isActive ? cc.bg : "transparent",
                    border: "none",
                    borderLeft: isActive ? "3px solid " + cc.tx : "3px solid transparent",
                    padding: "9px 16px",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg-secondary)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ fontSize: 15 }}>{c.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--text-heading)" : "var(--text-secondary)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {c.title}
                    </div>
                    {!isActive && (
                      <div style={{
                        fontSize: 10, color: "var(--text-muted)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {c.tagline}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          No concepts match "{search}"
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {CONCEPTS.length} concepts — all content bundled, no API calls.<br />
          More concepts added regularly.
        </div>
      </div>
    </div>
  );
}

// ── Mobile concept list ───────────────────────────────────────────────────────
function MobileConceptList({ active }: { active: Concept | null }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {CONCEPTS.map((c) => {
          const cc = CAT_COLOR[c.category] ?? { tx: "#a5b4fc", bg: "#6366f111" };
          const isActive = active?.slug === c.slug;
          return (
            <button
              key={c.slug}
              onClick={() => navigate(`/app/concepts/${c.slug}`)}
              style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 20,
                background: isActive ? cc.bg : "var(--bg-secondary)",
                border: "1px solid " + (isActive ? cc.tx + "66" : "var(--border-subtle)"),
                color: isActive ? cc.tx : "var(--text-secondary)",
                cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 400,
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              {c.emoji} {c.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ConceptsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const ctx = useOutletContext<LayoutContext>();
  const isMobile = ctx.isMobile;

  const [search, setSearch] = useState("");

  const active: Concept | null = slug
    ? (CONCEPTS_BY_SLUG.get(slug) ?? CONCEPTS[0])
    : CONCEPTS[0];

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <MobileConceptList active={active} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {active && <ConceptArticle concept={active} allConcepts={CONCEPTS} />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Sidebar */}
      <Sidebar active={active} search={search} onSearch={setSearch} />

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {active ? (
          <ConceptArticle concept={active} allConcepts={CONCEPTS} />
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            height: "100%", gap: 12, color: "var(--text-muted)", fontSize: 14,
          }}>
            <span style={{ fontSize: 36 }}>📖</span>
            <div>Select a concept from the sidebar</div>
            <Link to="/app/concepts/latency" style={{ color: "var(--accent)", fontSize: 13 }}>
              Start with Latency →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
