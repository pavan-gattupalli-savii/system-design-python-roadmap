// ── My Profile page ───────────────────────────────────────────────────────────
// Authenticated. Header card with avatar (GitHub if set), display name, email,
// "member since" line, and an admin badge — only when role === "admin".
// Two strips of stat cards (Awaiting review / Published) followed by an
// editable profile form with a sticky footer.

import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMyProfile } from "../hooks/useMyProfile";
import { patchMe, type MyProfile as MyProfileT } from "../api/me";
import { profileForm, type ProfileForm } from "../lib/schemas";
import {
  FormShell, Field, fieldInput, FormButton, FormFooter,
} from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";
import { useAuth } from "../lib/auth";
import type { Language } from "../data/roadmap-index";

const counts: { key: "readings" | "interviews" | "experiences" | "answers"; label: string }[] = [
  { key: "readings",    label: "Readings"     },
  { key: "interviews",  label: "Questions"    },
  { key: "experiences", label: "Experiences"  },
  { key: "answers",     label: "Answer docs"  },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function memberSince(iso?: string): string {
  if (!iso) return "Just now";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Just now";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function normalizeLinkedin(raw: string): { href: string; label: string } | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("http")) {
    try {
      const u = new URL(v);
      const handle = u.pathname.replace(/\/+$/, "").split("/").pop() || u.hostname;
      return { href: v, label: handle || v };
    } catch { return null; }
  }
  const handle = v.replace(/^@/, "");
  return { href: `https://www.linkedin.com/in/${handle}/`, label: handle };
}

export default function MyProfile() {
  const ctx  = useOutletContext<LayoutContext>();
  const { user } = useAuth();
  const qc   = useQueryClient();
  const { data: profile, isLoading } = useMyProfile();

  const [form, setForm] = useState<ProfileForm>({
    displayName: "",
    github:      "",
    linkedin:    "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName ?? "",
        github:      profile.github      ?? "",
        linkedin:    profile.linkedin    ?? "",
      });
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (payload: ProfileForm) => patchMe(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setSavedAt(Date.now());
    },
  });

  function update<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileForm.safeParse(form);
    if (!parsed.success) {
      const fieldErr: Partial<Record<keyof ProfileForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ProfileForm;
        if (k && !fieldErr[k]) fieldErr[k] = issue.message;
      }
      setErrors(fieldErr);
      return;
    }
    mutation.mutate(parsed.data);
  }

  const showAdmin = profile?.role === "admin";
  const linkedinView = useMemo(() => normalizeLinkedin(profile?.linkedin ?? ""), [profile?.linkedin]);

  const totalPending = profile
    ? counts.reduce((sum, c) => sum + (profile.pending[c.key] ?? 0), 0)
    : 0;

  return (
    <FormShell
      title="My profile"
      subtitle="Update how you appear next to your published readings, questions and experiences."
      isMobile={ctx.isMobile}
    >
      {/* ── Header card ───────────────────────────────────────────────── */}
      <ProfileHeader
        profile={profile}
        fallbackEmail={user?.email}
        showAdmin={showAdmin}
        linkedinView={linkedinView}
        memberSinceLabel={memberSince(profile?.createdAt)}
      />

      {/* ── Awaiting review (only when there's something pending) ─────── */}
      {totalPending > 0 && (
        <CountsStrip
          isMobile={ctx.isMobile}
          tone="pending"
          title="Awaiting review"
          counts={counts.map(({ key, label }) => ({ key, label, value: profile?.pending[key] ?? 0 }))}
        />
      )}

      {/* ── Published counts ───────────────────────────────────────────── */}
      <CountsStrip
        isMobile={ctx.isMobile}
        tone="published"
        title="Published"
        counts={counts.map(({ key, label }) => ({ key, label, value: profile?.published[key] ?? 0 }))}
      />

      {/* ── Editable form ──────────────────────────────────────────────── */}
      {isLoading
        ? <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 18 }}>Loading profile…</div>
        : (
          <form onSubmit={submit} style={{ marginTop: 18 }}>
            <Field label="Display name" hint="Shown next to readings/experiences you publish" error={errors.displayName}>
              <input style={fieldInput} value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Your name"/>
            </Field>

            <Field label="GitHub username (optional)" hint="Used for your avatar on the readings list" error={errors.github}>
              <input style={fieldInput} value={form.github ?? ""} onChange={(e) => update("github", e.target.value)} placeholder="octocat"/>
            </Field>

            <Field label="LinkedIn handle or URL (optional)" hint='e.g. "john-doe" or a full https://www.linkedin.com URL' error={errors.linkedin}>
              <input style={fieldInput} value={form.linkedin ?? ""} onChange={(e) => update("linkedin", e.target.value)} placeholder="john-doe"/>
            </Field>

            {/* ── Preferences (theme + language) ──────────────────────── */}
            <PreferencesSection
              isDark={ctx.isDark}
              setIsDark={ctx.setIsDark}
              lang={ctx.lang}
              setLang={ctx.setLang}
            />

            <FormFooter isMobile={ctx.isMobile}>
              {savedAt && Date.now() - savedAt < 4000 && (
                <span style={{ fontSize: 12, color: "#34d399", marginRight: "auto" }}>Saved ✓</span>
              )}
              <FormButton type="submit" primary disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save changes"}
              </FormButton>
            </FormFooter>
          </form>
        )}
    </FormShell>
  );
}

// ── Header card ─────────────────────────────────────────────────────────────
function ProfileHeader({
  profile, fallbackEmail, showAdmin, linkedinView, memberSinceLabel,
}: {
  profile?:        MyProfileT;
  fallbackEmail?:  string;
  showAdmin:       boolean;
  linkedinView:    { href: string; label: string } | null;
  memberSinceLabel: string;
}) {
  const display = profile?.displayName?.trim() || fallbackEmail || "—";
  const email   = profile?.email ?? fallbackEmail ?? "";
  const gh      = profile?.github?.trim();
  const initial = (display || "U").slice(0, 1).toUpperCase();

  return (
    <div style={{
      position: "relative",
      padding: 18,
      borderRadius: 14,
      background: "linear-gradient(135deg, #1e1b4b22, #0d111722), var(--bg-card)",
      border: "1px solid var(--border)",
      marginBottom: 18,
      display: "flex", alignItems: "center", gap: 14,
      flexWrap: "wrap",
    }}>
      {gh ? (
        <img
          src={`https://github.com/${gh}.png?size=120`}
          alt=""
          width={56}
          height={56}
          style={{
            borderRadius: "50%",
            border: "2px solid #6366f1",
            background: "var(--bg-secondary)",
            flexShrink: 0,
          }}
        />
      ) : (
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", display: "grid", placeItems: "center",
          fontWeight: 800, fontSize: 22, flexShrink: 0,
          border: "2px solid #6366f1",
        }}>
          {initial}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{
            fontSize: 18, fontWeight: 800, color: "var(--text-heading)",
            letterSpacing: -0.3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            maxWidth: "100%",
          }}>
            {display}
          </div>
          {showAdmin && (
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
              padding: "3px 8px", borderRadius: 999,
              background: "#7c3aed22", color: "#c4b5fd",
              border: "1px solid #7c3aed55",
            }}>
              Admin
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, wordBreak: "break-all" }}>
          {email}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span>Member since {memberSinceLabel}</span>
          {gh && (
            <a
              href={`https://github.com/${gh}`}
              target="_blank" rel="noreferrer"
              style={{ color: "#a5b4fc", textDecoration: "none" }}
            >
              github.com/{gh}
            </a>
          )}
          {linkedinView && (
            <a
              href={linkedinView.href}
              target="_blank" rel="noreferrer"
              style={{ color: "#a5b4fc", textDecoration: "none" }}
            >
              linkedin/{linkedinView.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Counts strip ────────────────────────────────────────────────────────────
function CountsStrip({
  isMobile, tone, title, counts,
}: {
  isMobile: boolean;
  tone:     "pending" | "published";
  title:    string;
  counts:   { key: string; label: string; value: number }[];
}) {
  const accent = tone === "pending" ? "#fbbf24" : "var(--text-heading)";
  return (
    <section style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
        color: tone === "pending" ? "#fbbf24" : "var(--text-muted)",
        marginBottom: 6,
      }}>
        {title}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: 8,
      }}>
        {counts.map((c) => (
          <div key={c.key} style={{
            padding: "10px 12px", borderRadius: 10,
            background: "var(--bg-card)",
            border: "1px solid " + (tone === "pending" ? "#fbbf2455" : "var(--border-subtle)"),
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: accent, marginTop: 2 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Preferences section ─────────────────────────────────────────────────────
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{
      display: "inline-flex",
      background: "var(--bg-secondary)",
      borderRadius: 10,
      padding: 3,
      gap: 3,
      border: "1px solid var(--border)",
    }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: "7px 16px",
            borderRadius: 7,
            fontSize: 13,
            fontWeight: opt.value === value ? 700 : 500,
            background: opt.value === value
              ? "linear-gradient(135deg, #6366f1, #7c3aed)"
              : "transparent",
            color: opt.value === value ? "#fff" : "var(--text-secondary)",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
            boxShadow: opt.value === value ? "0 1px 4px #6366f144" : "none",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 1.3,
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.1,
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: 8,
  display: "block",
};

function PreferencesSection({
  isDark, setIsDark, lang, setLang,
}: {
  isDark: boolean;
  setIsDark: (v: boolean | ((d: boolean) => boolean)) => void;
  lang: Language;
  setLang: (l: Language) => void;
}) {
  return (
    <div style={{
      marginTop: 28,
      padding: "18px 20px",
      borderRadius: 12,
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
    }}>
      <div style={{ ...sectionLabelStyle, marginBottom: 18 }}>Preferences</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <span style={fieldLabelStyle}>Theme</span>
          <SegmentedControl<"light" | "dark">
            options={[
              { label: "☀️ Light", value: "light" },
              { label: "🌙 Dark",  value: "dark"  },
            ]}
            value={isDark ? "dark" : "light"}
            onChange={(v) => setIsDark(v === "dark")}
          />
        </div>
        <div>
          <span style={fieldLabelStyle}>Language</span>
          <SegmentedControl<Language>
            options={[
              { label: "🐍 Python", value: "python" },
              { label: "☕ Java",   value: "java"   },
            ]}
            value={lang}
            onChange={setLang}
          />
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 14 }}>
        Also switchable anytime from the header bar.
      </div>
    </div>
  );
}
