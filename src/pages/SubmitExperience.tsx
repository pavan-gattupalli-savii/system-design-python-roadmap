// ── Submit Interview Experience page ─────────────────────────────────────────
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { useMyProfile } from "../hooks/useMyProfile";
import { EXP_PLATFORMS, EXP_OUTCOMES } from "../data/interviews";
import { apiFetch } from "../api/client";
import { experienceForm, type ExperienceForm } from "../lib/schemas";
import {
  FormShell, Field, FieldGrid, fieldInput, FormButton, FormFooter, PostingAs,
} from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";

export default function SubmitExperience() {
  const ctx = useOutletContext<LayoutContext>();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title:    "",
    url:      "",
    platform: "Blog",
    company:  "",
    role:     "",
    outcome:  "" as "" | "Offer" | "Rejected" | "Ongoing" | "Unknown",
    topics:   "",
    notes:    "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ExperienceForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof ExperienceForm]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

    const payload = {
      title:    form.title,
      url:      form.url,
      platform: form.platform,
      company:  form.company,
      role:     form.role,
      outcome:  form.outcome || undefined,
      topics:   csv(form.topics),
      notes:    form.notes || undefined,
    };

    const parsed = experienceForm.safeParse(payload);
    if (!parsed.success) {
      const fieldErr: Partial<Record<keyof ExperienceForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ExperienceForm;
        if (k && !fieldErr[k]) fieldErr[k] = issue.message;
      }
      setErrors(fieldErr);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/experiences/submit", {
        method: "POST",
        body:   JSON.stringify(parsed.data),
      });
      qc.invalidateQueries({ queryKey: ["me"] });
      setDone(true);
      setTimeout(() => navigate("/app/interview"), 1500);
    } catch (err) {
      setErrors({ title: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <FormShell title="Submitted" subtitle="Thanks for sharing — admins will review it shortly." isMobile={ctx.isMobile}>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Redirecting…</div>
      </FormShell>
    );
  }

  const displayName = profile?.displayName ?? user?.displayName ?? "";
  const github      = profile?.github      ?? user?.github      ?? "";

  return (
    <FormShell
      title="Share an interview experience"
      subtitle="Link to a write-up, video, or post that walks through what you went through. Helpful posts highlight company, role, and what you'd do differently."
      isMobile={ctx.isMobile}
    >
      <PostingAs displayName={displayName} email={user?.email} github={github} />

      <form onSubmit={submit}>
        <Field label="Title" error={errors.title}>
          <input style={fieldInput} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="My system design loop at Stripe (E5)"/>
        </Field>

        <Field label="URL" error={errors.url}>
          <input style={fieldInput} value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://..."/>
        </Field>

        <FieldGrid isMobile={ctx.isMobile}>
          <Field label="Platform">
            <select style={fieldInput} value={form.platform} onChange={(e) => update("platform", e.target.value)}>
              {EXP_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>

          <Field label="Outcome (optional)">
            <select style={fieldInput} value={form.outcome} onChange={(e) => update("outcome", e.target.value as typeof form.outcome)}>
              <option value="">— pick one —</option>
              {EXP_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>

          <Field label="Company" error={errors.company}>
            <input style={fieldInput} value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Stripe"/>
          </Field>

          <Field label="Role" error={errors.role}>
            <input style={fieldInput} value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Senior Software Engineer"/>
          </Field>
        </FieldGrid>

        <Field label="Topics covered (comma-separated)">
          <input style={fieldInput} value={form.topics} onChange={(e) => update("topics", e.target.value)} placeholder="rate-limiting, distributed-cache"/>
        </Field>

        <Field label="Notes / one-line summary (optional)">
          <textarea style={{ ...fieldInput, minHeight: 70 }} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="What pushed the bar / what tripped you up?"/>
        </Field>

        <FormFooter isMobile={ctx.isMobile}>
          <FormButton onClick={() => navigate(-1)}>Cancel</FormButton>
          <FormButton type="submit" primary disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for review"}
          </FormButton>
        </FormFooter>
      </form>
    </FormShell>
  );
}
