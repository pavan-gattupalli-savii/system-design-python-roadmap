// ── CONTRIBUTE TAB ──────────────────────────────────────────────────────────
// On-site contribution guide — mirrors CONTRIBUTING.md with a card-based UI.

import { useNavigate } from "react-router-dom";

const GITHUB_REPO = "https://github.com/pavan-gattupalli-savii/system-design-python-roadmap";
const LINKEDIN_URL = "https://www.linkedin.com/in/iamgpavan/";

const WAYS = [
  {
    icon: "🧠",
    title: "Add a Concept",
    desc: "Write a new in-depth concept page with an SVG diagram, comparison tables, and interview tips.",
    effort: "Medium",
    effortCol: "#fbbf24",
    impact: "High",
  },
  {
    icon: "📚",
    title: "Suggest a Reading",
    desc: "Add a curated article, paper, book, or video to the Reading List — one entry in a TypeScript file.",
    effort: "Low",
    effortCol: "#34d399",
    impact: "Medium",
  },
  {
    icon: "💬",
    title: "Share an Interview Experience",
    desc: "Share what system design question you got, your approach, and the outcome. Completely anonymous if preferred.",
    effort: "Low",
    effortCol: "#34d399",
    impact: "High",
  },
  {
    icon: "🐛",
    title: "Report a Bug or Typo",
    desc: "Spotted incorrect information, a broken link, or a typo? Open a GitHub Issue — every fix matters.",
    effort: "Very Low",
    effortCol: "#6366f1",
    impact: "Medium",
  },
];

const STEPS = [
  {
    num: "1",
    title: "Fork & Clone",
    code: `git clone https://github.com/pavan-gattupalli-savii/system-design-python-roadmap.git
cd system-design-python-roadmap && npm install`,
  },
  {
    num: "2",
    title: "Start the Dev Server",
    code: `npm run dev\n# → http://localhost:5173`,
  },
  {
    num: "3",
    title: "Create your concept file",
    code: `// src/data/concepts/your-topic.ts
export const yourTopic: Concept = {
  slug:     "your-topic",
  title:    "Your Topic",
  emoji:    "🔧",
  category: "Architecture",
  tagline:  "One punchy sentence",
  sections: [ /* ... */ ],
};`,
  },
  {
    num: "4",
    title: "Register in index.ts",
    code: `// src/data/concepts/index.ts
import { yourTopic } from "./your-topic";
export const CONCEPTS = [...existing, yourTopic];`,
  },
  {
    num: "5",
    title: "Open a Pull Request",
    code: `git checkout -b feat/concept-your-topic
git add -A && git commit -m "feat(concepts): add YourTopic"
git push origin feat/concept-your-topic`,
  },
];

const CONVENTIONS = [
  { icon: "🎨", rule: "Inline styles only", detail: "Use style={{...}} — no CSS classnames, no new .css files" },
  { icon: "🌗", rule: "CSS variables for colour", detail: "var(--text-heading), var(--bg-panel), var(--border) for dark/light mode" },
  { icon: "🔷", rule: "TypeScript strictly", detail: "No any, follow existing interfaces. DiagramKey and ConceptCategory are union types." },
  { icon: "📐", rule: "SVG diagram pattern", detail: 'viewBox="0 0 700 H", width="100%", wrapped in div with overflowX:auto' },
];

export function ContributeTab({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "32px 48px", maxWidth: 760, margin: "0 auto", width: "100%" }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #6366f115, #34d39910)", border: "1px solid var(--border)", borderRadius: 14, padding: isMobile ? "22px" : "30px 36px", marginBottom: 28 }}>
        <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "var(--text-heading)", marginBottom: 8 }}>
          🤝 Contribute to the Roadmap
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
          This is an open-source project — every concept, reading, and interview experience was written by someone who wanted to make system design learning better. Add yours.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "var(--bg-panel)", border: "1px solid var(--border)",
              color: "var(--text-bright)", borderRadius: 8, padding: "9px 18px",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            View on GitHub ↗
          </a>
          <a
            href={`${GITHUB_REPO}/issues/new`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "#6366f1", color: "#fff",
              borderRadius: 8, padding: "9px 18px",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            + Open an Issue ↗
          </a>
        </div>
      </div>

      {/* ── Ways to contribute ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Ways to Contribute
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
        {WAYS.map(({ icon, title, desc, effort, effortCol, impact }) => (
          <div key={title} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>{desc}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: effortCol, background: effortCol + "18", borderRadius: 5, padding: "2px 8px" }}>
                Effort: {effort}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", background: "#6366f118", borderRadius: 5, padding: "2px 8px" }}>
                Impact: {impact}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Step-by-step: Add a Concept ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Step-by-Step: Add a Concept
      </div>
      <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", marginBottom: 28 }}>
        {STEPS.map(({ num, title, code }) => (
          <div key={num} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>{num}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)" }}>{title}</div>
            </div>
            <pre style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 7,
              padding: "12px 14px",
              fontSize: 11,
              color: "#94a3b8",
              overflowX: "auto",
              margin: 0,
              lineHeight: 1.6,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            }}>
              <code>{code}</code>
            </pre>
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <a
            href={`${GITHUB_REPO}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "#6366f1", textDecoration: "none", fontWeight: 600 }}
          >
            📄 Read the full CONTRIBUTING.md ↗
          </a>
        </div>
      </div>

      {/* ── Code conventions ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Code Conventions
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
        {CONVENTIONS.map(({ icon, rule, detail }) => (
          <div key={rule} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 9, padding: "12px 16px", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-bright)", marginBottom: 3 }}>{rule}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Questions ── */}
      <div style={{ background: "var(--bg-panel)", border: "1px solid #0077B530", borderRadius: 10, padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ fontSize: 30 }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 4 }}>Questions? Ideas?</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
            Open a GitHub Discussion or reach out on LinkedIn — happy to review concepts, answer questions, or pair on a contribution.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`${GITHUB_REPO}/discussions`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--bg-panel)", border: "1px solid var(--border)", color: "var(--text-bright)", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
            >
              GitHub Discussions ↗
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#0077B5", color: "#fff", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
