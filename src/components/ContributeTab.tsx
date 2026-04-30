// ── CONTRIBUTE TAB ──────────────────────────────────────────────────────────
// Guide to in-app contribution — Readings, Interview Experiences, Q&A.

import { useNavigate } from "react-router-dom";

const LINKEDIN_URL = "https://www.linkedin.com/in/iamgpavan/";

const WAYS = [
  {
    icon: "📚",
    title: "Suggest a Reading",
    desc: "Add a curated article, video, paper, or book to the Reading List. Anyone can browse and filter resources from the Readings tab.",
    effort: "Low",
    effortCol: "#34d399",
    impact: "High",
    route: "/app/readings",
    cta: "Go to Readings →",
  },
  {
    icon: "💬",
    title: "Share an Interview Experience",
    desc: "Post a real system design question you received — your approach, the company level, and outcome. Fully anonymous if you prefer.",
    effort: "Low",
    effortCol: "#34d399",
    impact: "High",
    route: "/app/interviews",
    cta: "Go to Interviews →",
  },
  {
    icon: "❓",
    title: "Submit a Practice Q&A",
    desc: "Add a system design question with hints and key answer points for others to drill before their interviews.",
    effort: "Low",
    effortCol: "#34d399",
    impact: "High",
    route: "/app/interviews",
    cta: "Go to Q&A →",
  },
  {
    icon: "🐛",
    title: "Report an Error or Typo",
    desc: "Spotted incorrect information or a broken link? Drop a message on LinkedIn and it'll be fixed quickly.",
    effort: "Very Low",
    effortCol: "#6366f1",
    impact: "Medium",
    route: null as string | null,
    cta: "Message on LinkedIn →",
  },
];

const HOW_IT_WORKS = [
  {
    icon: "📚",
    title: "Readings",
    steps: [
      "Open the Readings tab from the sidebar.",
      "Click \"Suggest a Reading\" and fill in: title, URL, type (Article / Video / Paper / Book), relevant topic tags, and a short note on why it's valuable.",
      "Once reviewed, it appears in the community list for everyone to browse, filter, and upvote.",
    ],
    note: "Good readings: engineering blog posts, conference talks, architecture case studies, classic papers (Dynamo, Bigtable, Kafka, etc.).",
  },
  {
    icon: "💬",
    title: "Interview Experiences",
    steps: [
      "Go to the Interviews tab and choose \"Share Your Experience\".",
      "Fill in: company (or \"Undisclosed\"), role level, round type, the system design question asked, your approach, and the outcome.",
      "You can leave name fields blank — the post will appear anonymously.",
    ],
    note: "Describe the question honestly. Specific details help future candidates more than vague summaries — interviewers change questions often.",
  },
  {
    icon: "❓",
    title: "Practice Q&A",
    steps: [
      "Open the Interviews tab and go to the Q&A section.",
      "Submit a question with: the prompt, 2–3 clarifying hints, and the key points a strong answer should cover.",
      "Community members can add discussion links and vote on the best answer approaches.",
    ],
    note: "Focus on questions you've actually been asked or have drilled. Real questions with real hints are more useful than generic prompts.",
  },
];

export function ContributeTab({ isMobile }: { isMobile: boolean }) {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px" : "32px 48px", maxWidth: 760, margin: "0 auto", width: "100%" }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg, #6366f115, #34d39910)", border: "1px solid var(--border)", borderRadius: 14, padding: isMobile ? "22px" : "30px 36px", marginBottom: 28 }}>
        <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "var(--text-heading)", marginBottom: 8 }}>
          🤝 Help Others Learn System Design
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          Every reading, interview experience, and practice question on this site was shared by someone who wanted better system design resources. Add yours — right from within the app, no account or setup needed.
        </div>
      </div>

      {/* ── Ways to contribute ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        Ways to Contribute
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
        {WAYS.map(({ icon, title, desc, effort, effortCol, impact, route, cta }) => (
          <div key={title} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10, flex: 1 }}>{desc}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: effortCol, background: effortCol + "18", borderRadius: 5, padding: "2px 8px" }}>
                Effort: {effort}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#6366f1", background: "#6366f118", borderRadius: 5, padding: "2px 8px" }}>
                Impact: {impact}
              </span>
            </div>
            {route ? (
              <button
                onClick={() => navigate(route)}
                style={{ alignSelf: "flex-start", background: "#6366f1", color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                {cta}
              </button>
            ) : (
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ alignSelf: "flex-start", background: "#0077B5", color: "#fff", borderRadius: 7, padding: "6px 14px", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
              >
                {cta}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        How It Works
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {HOW_IT_WORKS.map(({ icon, title, steps, note }) => (
          <div key={title} style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 22px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-bright)", marginBottom: 12 }}>
              {icon} {title}
            </div>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", marginTop: 1 }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{step}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, background: "var(--bg-secondary)", borderRadius: 7, padding: "10px 12px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
              💡 {note}
            </div>
          </div>
        ))}
      </div>

      {/* ── Questions ── */}
      <div style={{ background: "var(--bg-panel)", border: "1px solid #0077B530", borderRadius: 10, padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ fontSize: 30 }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 4 }}>Questions or Ideas?</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
            Have a suggestion for a new feature, concept, or quality improvement? Reach out on LinkedIn.
          </div>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#0077B5", color: "#fff", borderRadius: 7, padding: "7px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
          >
            Message on LinkedIn ↗
          </a>
        </div>
      </div>

    </div>
  );
}
