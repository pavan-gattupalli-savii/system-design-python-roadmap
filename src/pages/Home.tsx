// ── Home page (public landing) ───────────────────────────────────────────────
// Big hero, feature grid, footer with creator profile. Reachable at "/" and
// the post-sign-out redirect.

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { APP_TITLE, APP_SUBTITLE } from "../constants/app";
import { FONT_STACK } from "../constants/theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { useAuth } from "../lib/auth";

const LINKEDIN_URL = "https://www.linkedin.com/in/iamgpavan";
const GITHUB_REPO  = "https://github.com/pavan-gattupalli-savii/system-design-python-roadmap";

const FEATURES = [
  { icon: "🗺️", label: "Phase-by-phase roadmap",   desc: "Foundations → LLD → HLD → Reliability → Interview prep, mapped onto Python and Java tracks you can switch between." },
  { icon: "📚", label: "600+ curated free resources", desc: "Books, papers, videos and labs — every entry community-suggested and admin-reviewed before it ships." },
  { icon: "💬", label: "Real interview experiences", desc: "First-hand accounts from Google, Amazon, Meta and more — alongside Q&A with hints and community answer docs." },
  { icon: "✅", label: "Per-account progress",     desc: "Sign in to track completed sessions across devices. Falls back to local storage when signed out." },
  { icon: "🛠️", label: "In-app submissions",       desc: "Publish a reading, share an experience or contribute a question — straight from the app, no PR required." },
  { icon: "🌗", label: "Light + dark theme",       desc: "Tuned for late-night study sessions. Theme is persisted between visits." },
];

export default function Home() {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  useEffect(() => {
    document.title = APP_TITLE + " — system design roadmap with curated readings + interviews";
  }, []);

  return (
    <div style={{
      fontFamily: FONT_STACK,
      minHeight: "100vh",
      background: "radial-gradient(circle at 20% 0%, #312e8133 0%, transparent 40%), radial-gradient(circle at 90% 100%, #0ea5e91a 0%, transparent 35%), var(--bg-page)",
      color: "var(--text-body)",
    }}>
      {/* Top nav */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "16px 18px" : "20px 36px",
        maxWidth: 1200, margin: "0 auto",
      }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18, color: "var(--text-heading)", letterSpacing: -0.3 }}>
            {APP_TITLE}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{APP_SUBTITLE}</div>
        </Link>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/app/overview" style={{ fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}>
            Browse roadmap
          </Link>
          {user ? (
            <Link to="/app/me" style={{
              background: "#6366f1", color: "#fff", borderRadius: 7,
              padding: "7px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              Open dashboard
            </Link>
          ) : (
            <Link to="/sign-in" style={{
              background: "#6366f1", color: "#fff", borderRadius: 7,
              padding: "7px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              Sign in
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section style={{
        maxWidth: 980, margin: "0 auto",
        padding: isMobile ? "32px 18px 24px" : "60px 36px 40px",
        textAlign: "center",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 999,
          background: "#6366f122", border: "1px solid #6366f155",
          color: "#a5b4fc", fontSize: 11, fontWeight: 700, letterSpacing: 1,
          textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }} />
          Free · open · community-curated
        </span>
        <h1 style={{
          fontSize: isMobile ? 30 : 48,
          margin: "20px auto 18px",
          color: "var(--text-heading)", letterSpacing: -1, lineHeight: 1.1, maxWidth: 820,
        }}>
          A focused way to learn system design, using{" "}
          <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            free resources.
          </span>
        </h1>
        <p style={{
          fontSize: isMobile ? 15 : 17, lineHeight: 1.6,
          color: "var(--text-secondary)", maxWidth: 720, margin: "0 auto 30px",
        }}>
          A community-curated path through the best free readings, real interview Q&A and field experiences —
          organised so you always know what to study next. Pick Python or Java and start where you are.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to={user ? "/app/overview" : "/sign-in"} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#6366f1", color: "#fff", border: "none",
            borderRadius: 9, padding: "12px 22px", fontSize: 14, fontWeight: 700,
            textDecoration: "none", boxShadow: "0 6px 18px #6366f155",
          }}>
            {user ? "Open dashboard" : "Get started — free"}
            <span aria-hidden>→</span>
          </Link>
          <Link to="/app/overview" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "transparent", color: "var(--text-secondary)",
            border: "1px solid var(--border)", borderRadius: 9,
            padding: "12px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>
            Browse roadmap →
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "16px 18px 40px" : "20px 36px 60px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: 16,
        }}>
          {FEATURES.map((f) => (
            <div key={f.label} style={{
              background: "var(--bg-panel)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "20px 22px",
            }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)", marginBottom: 6 }}>{f.label}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator footer */}
      <footer style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "24px 18px 56px" : "40px 36px 80px",
      }}>
        <div style={{
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          borderRadius: 14, padding: isMobile ? 20 : "28px 32px",
          display: "flex", flexDirection: isMobile ? "column" : "row",
          gap: 22, alignItems: isMobile ? "flex-start" : "center",
        }}>
          <div style={{
            flexShrink: 0, width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
          }}>
            🐍☕
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)", marginBottom: 4 }}>
              Built by Pavan Kumar
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
              I put this together while learning system design from the open web — and now publish it
              so others can skip the trial-and-error and study from the same shortlist.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={creatorLink}>💼 LinkedIn</a>
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" style={creatorLink}>⭐ GitHub repo</a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--text-muted)" }}>
          Open-source · MIT licensed · Community submissions reviewed by admins.
        </div>
      </footer>
    </div>
  );
}

const creatorLink: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "var(--bg-card)", border: "1px solid var(--border-mid)",
  color: "var(--text-secondary)", borderRadius: 7,
  padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none",
};
