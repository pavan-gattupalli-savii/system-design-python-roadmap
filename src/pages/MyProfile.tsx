// ── My Profile page ───────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMyProfile } from "../hooks/useMyProfile";
import { patchMe } from "../api/me";
import { profileForm, type ProfileForm } from "../lib/schemas";
import { FormButton, fieldInput } from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";
import { useAuth } from "../lib/auth";
import type { Language } from "../data/roadmap-index";
import BookmarksTab from "../components/BookmarksTab";
import { useBuilds } from "../hooks/useBuilds";

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

const STAT_ICONS: Record<string, string> = {
  readings: "📖",
  interviews: "💬",
  experiences: "🏢",
  answers: "📝",
  builds: "🔨",
};

const statKeys: { key: "readings" | "interviews" | "experiences" | "answers" | "builds"; label: string; href: string }[] = [
  { key: "readings",    label: "Readings",    href: "/app/readings"  },
  { key: "interviews",  label: "Questions",   href: "/app/interview" },
  { key: "experiences", label: "Experiences", href: "/app/interview" },
  { key: "answers",     label: "Answers",     href: "/app/interview" },
  { key: "builds",      label: "Builds",      href: "/app/roadmap"  },
];

export default function MyProfile() {
  const ctx  = useOutletContext<LayoutContext>();
  const { user } = useAuth();
  const qc   = useQueryClient();
  const { data: profile, isLoading } = useMyProfile();

  // Fetch build submissions for both languages so the profile list is complete
  const { submissions: buildsPy }   = useBuilds("python");
  const { submissions: buildsJava } = useBuilds("java");
  const allBuilds = [...buildsPy.values(), ...buildsJava.values()]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const [tab, setTab] = useState<"info" | "prefs" | "bookmarks">("info");
  const [form, setForm] = useState<ProfileForm>({ displayName: "", github: "", linkedin: "" });
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

  const showAdmin  = profile?.role === "admin";
  const linkedinView = useMemo(() => normalizeLinkedin(profile?.linkedin ?? ""), [profile?.linkedin]);
  const display    = profile?.displayName?.trim() || user?.email || "—";
  const email      = profile?.email ?? user?.email ?? "";
  const gh         = profile?.github?.trim() || "";
  const initial    = (display || "U").slice(0, 1).toUpperCase();
  const sinceLabel = memberSince(profile?.createdAt);

  const totalPending   = profile ? statKeys.reduce((s, c) => s + (profile.pending[c.key] ?? 0), 0) : 0;
  const totalPublished = profile ? statKeys.reduce((s, c) => s + (profile.published[c.key] ?? 0), 0) : 0;

  const pad = ctx.isMobile ? "16px 14px 96px" : "24px 32px 96px";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: pad }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Hero card ──────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--border)",
          marginBottom: 20,
          background: "var(--bg-card)",
        }}>
          {/* Banner */}
          <div style={{
            height: 90,
            background: "linear-gradient(120deg, #312e81 0%, #4c1d95 50%, #1e3a5f 100%)",
          }} />

          {/* Avatar + identity row */}
          <div style={{
            padding: ctx.isMobile ? "0 16px 16px" : "0 24px 20px",
            marginTop: -36,
            display: "flex",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap",
          }}>
            {gh ? (
              <img
                src={`https://github.com/${gh}.png?size=120`}
                alt=""
                width={72}
                height={72}
                style={{
                  borderRadius: "50%",
                  border: "3px solid var(--bg-card)",
                  background: "var(--bg-secondary)",
                  flexShrink: 0,
                  boxShadow: "0 2px 12px #00000044",
                }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", display: "grid", placeItems: "center",
                fontWeight: 800, fontSize: 26, flexShrink: 0,
                border: "3px solid var(--bg-card)",
                boxShadow: "0 2px 12px #00000044",
              }}>
                {initial}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0, paddingTop: 38 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-heading)", letterSpacing: -0.3 }}>
                  {display}
                </span>
                {showAdmin && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
                    padding: "3px 9px", borderRadius: 999,
                    background: "#7c3aed22", color: "#c4b5fd",
                    border: "1px solid #7c3aed55",
                  }}>Admin</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
            </div>

            {/* Meta links */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
              fontSize: 11, color: "var(--text-muted)",
              paddingTop: ctx.isMobile ? 0 : 38,
              width: ctx.isMobile ? "100%" : undefined,
            }}>
              <span>Member since {sinceLabel}</span>
              {gh && (
                <a href={`https://github.com/${gh}`} target="_blank" rel="noreferrer"
                  style={{ color: "#a5b4fc", textDecoration: "none" }}>GitHub ↗</a>
              )}
              {linkedinView && (
                <a href={linkedinView.href} target="_blank" rel="noreferrer"
                  style={{ color: "#a5b4fc", textDecoration: "none" }}>LinkedIn ↗</a>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${ctx.isMobile ? 2 : 5}, 1fr)`,
            borderTop: "1px solid var(--border-subtle)",
          }}>
            {statKeys.map(({ key, label, href }, i) => {
              const pub  = profile?.published[key] ?? 0;
              const pend = profile?.pending[key]   ?? 0;
              // Mobile: 2 cols, 5 items → rows 0-1 (i<4) and row 2 (i=4). Row 2 needs top border.
              const isLastRow = ctx.isMobile ? i >= 4 : false;
              const isOddRight = ctx.isMobile && i % 2 === 1;
              return (
                <Link
                  key={key}
                  to={href}
                  style={{
                    display: "block",
                    padding: "14px 16px",
                    borderRight: !isOddRight && i < statKeys.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                    borderTop: isLastRow ? "1px solid var(--border-subtle)" : undefined,
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "background 0.13s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{STAT_ICONS[key]}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-heading)", lineHeight: 1 }}>
                    {pub}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
                  {pend > 0 && (
                    <div style={{
                      display: "inline-block", marginTop: 6,
                      fontSize: 10, fontWeight: 700, color: "#fbbf24",
                      background: "#fbbf2415", border: "1px solid #fbbf2430",
                      borderRadius: 999, padding: "2px 7px",
                    }}>
                      {pend} pending
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Summary bar */}
          <div style={{
            padding: "10px 20px",
            borderTop: "1px solid var(--border-subtle)",
            display: "flex", gap: 20, flexWrap: "wrap",
            fontSize: 12, color: "var(--text-muted)",
          }}>
            <span><strong style={{ color: "var(--text-secondary)" }}>{totalPublished}</strong> published</span>
            {totalPending > 0 && (
              <span style={{ color: "#fbbf24" }}>
                <strong>{totalPending}</strong> awaiting review
              </span>
            )}
          </div>
        </div>

        {/* ── Tab switcher ───────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 4,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 20,
        }}>
          {(["info", "prefs", "bookmarks"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: tab === t ? 700 : 500,
                background: tab === t
                  ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                  : "transparent",
                color: tab === t ? "#fff" : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                boxShadow: tab === t ? "0 1px 6px #6366f133" : "none",
              }}
            >
              {t === "info" ? "✏️  Edit Profile" : t === "prefs" ? "⚙️  Preferences" : "★ Bookmarks"}
            </button>
          ))}
        </div>

        {/* ── Edit info tab ──────────────────────────────────────────── */}
        {tab === "info" && (
          isLoading
            ? <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "20px 0" }}>Loading…</div>
            : (
              <>
                <form onSubmit={submit}>
                <SectionCard title="Identity">
                  <FieldRow label="Display name" hint="Shown next to readings and experiences you publish" error={errors.displayName}>
                    <input
                      style={fieldInput}
                      value={form.displayName}
                      onChange={(e) => update("displayName", e.target.value)}
                      placeholder="Your name"
                    />
                  </FieldRow>
                </SectionCard>

                <SectionCard title="Social links" style={{ marginTop: 14 }}>
                  <FieldRow label="GitHub username" hint="Pulls your avatar on the readings list" error={errors.github}>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                        fontSize: 12, color: "var(--text-muted)", pointerEvents: "none", userSelect: "none",
                      }}>github.com/</span>
                      <input
                        style={{ ...fieldInput, paddingLeft: 82 }}
                        value={form.github ?? ""}
                        onChange={(e) => update("github", e.target.value)}
                        placeholder="octocat"
                      />
                    </div>
                  </FieldRow>
                  <FieldRow label="LinkedIn" hint='Handle (e.g. "john-doe") or full https://linkedin.com URL' error={errors.linkedin}>
                    <input
                      style={fieldInput}
                      value={form.linkedin ?? ""}
                      onChange={(e) => update("linkedin", e.target.value)}
                      placeholder="john-doe"
                    />
                  </FieldRow>
                </SectionCard>

                <div style={{
                  marginTop: 18,
                  display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center",
                  flexWrap: "wrap",
                }}>
                  {savedAt && Date.now() - savedAt < 4000 && (
                    <span style={{ fontSize: 12, color: "#34d399", marginRight: "auto" }}>✓ Saved</span>
                  )}
                  {mutation.isError && (
                    <span style={{ fontSize: 12, color: "#f87171", marginRight: "auto" }}>Save failed — try again</span>
                  )}
                  <FormButton type="submit" primary disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving…" : "Save changes"}
                  </FormButton>
                </div>
              </form>

              {/* ── My Builds list ──────────────────────────────── */}
              {allBuilds.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <SectionCard title={`🔨 My Builds (${allBuilds.length})`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {allBuilds.map((b) => {
                        const [ph, wk] = b.resourceKey.split("_");
                        const label = `Phase ${ph} · Week ${wk}`;
                        const langLabel = buildsPy.has(b.resourceKey) ? "Python" : "Java";
                        const date = new Date(b.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        return (
                          <div key={b.resourceKey + b.githubUrl} style={{
                            display: "flex", gap: 12, alignItems: "flex-start",
                            padding: "10px 0", borderBottom: "1px solid var(--border-subtle)",
                          }}>
                            <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🔨</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-heading)" }}>{label}</span>
                                <span style={{ fontSize: 10, color: "#a5b4fc", background: "#6366f118", border: "1px solid #6366f130", borderRadius: 4, padding: "1px 6px" }}>{langLabel}</span>
                                <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>{date}</span>
                              </div>
                              <a
                                href={b.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: 12, color: "#4ade80", textDecoration: "none", wordBreak: "break-all" }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                              >
                                {b.githubUrl} ↗
                              </a>
                              {b.notes && (
                                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>{b.notes}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SectionCard>
                </div>
              )}
              </>
            )
        )}

        {/* ── Preferences tab ───────────────────────────────────────── */}
        {tab === "prefs" && (
          <SectionCard title="Preferences">
            <div style={{ display: "grid", gridTemplateColumns: ctx.isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
              <PreferenceItem label="Theme">
                <SegmentedControl<"light" | "dark">
                  options={[
                    { label: "☀️ Light", value: "light" },
                    { label: "🌙 Dark",  value: "dark"  },
                  ]}
                  value={ctx.isDark ? "dark" : "light"}
                  onChange={(v) => ctx.setIsDark(v === "dark")}
                />
              </PreferenceItem>
              <PreferenceItem label="Language">
                <SegmentedControl<Language>
                  options={[
                    { label: "🐍 Python", value: "python" },
                    { label: "☕ Java",   value: "java"   },
                  ]}
                  value={ctx.lang}
                  onChange={ctx.setLang}
                />
              </PreferenceItem>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
              These preferences are also switchable from the header bar at any time.
            </div>
          </SectionCard>
        )}

        {tab === "bookmarks" && <BookmarksTab />}

      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title, children, style,
}: {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      overflow: "hidden",
      ...style,
    }}>
      <div style={{
        padding: "12px 18px",
        borderBottom: "1px solid var(--border-subtle)",
        fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
        textTransform: "uppercase", color: "var(--text-muted)",
      }}>
        {title}
      </div>
      <div style={{ padding: "16px 18px" }}>
        {children}
      </div>
    </div>
  );
}

function FieldRow({
  label, hint, error, children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block",
        fontSize: 11, fontWeight: 700, letterSpacing: 1.1,
        textTransform: "uppercase", color: "var(--text-muted)",
        marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error
        ? <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{error}</div>
        : hint
          ? <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>
          : null}
    </div>
  );
}

function PreferenceItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.1,
        textTransform: "uppercase", color: "var(--text-muted)",
        marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options, value, onChange,
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
