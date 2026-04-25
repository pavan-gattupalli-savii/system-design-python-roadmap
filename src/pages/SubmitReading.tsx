// ── Submit Reading page ──────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { useMyProfile } from "../hooks/useMyProfile";
import { POST_TYPES, DIFFICULTIES } from "../data/readings";
import { apiFetch } from "../api/client";
import { readingForm, type ReadingForm } from "../lib/schemas";
import {
  FormShell, Field, FieldGrid, fieldInput, FormButton, FormFooter, PostingAs,
} from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";

export default function SubmitReading() {
  const ctx = useOutletContext<LayoutContext>();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    type:       "Blog",
    title:      "",
    url:        "",
    topics:     "",
    difficulty: "" as "" | "Beginner" | "Intermediate" | "Advanced",
    notes:      "",
  });
  const [errors, setErrors]   = useState<Partial<Record<keyof ReadingForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof ReadingForm]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const topics = form.topics.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      type:       form.type,
      title:      form.title,
      url:        form.url,
      topics,
      difficulty: form.difficulty || undefined,
      notes:      form.notes || undefined,
    };

    const parsed = readingForm.safeParse(payload);
    if (!parsed.success) {
      const fieldErr: Partial<Record<keyof ReadingForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof ReadingForm;
        if (k && !fieldErr[k]) fieldErr[k] = issue.message;
      }
      setErrors(fieldErr);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/readings/submit", {
        method: "POST",
        body:   JSON.stringify(parsed.data),
      });
      qc.invalidateQueries({ queryKey: ["me"] });
      setDone(true);
      setTimeout(() => navigate("/app/readings"), 1500);
    } catch (err) {
      setErrors({ title: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <FormShell
        title="Submitted ✓"
        subtitle="Thanks! Your reading is now in the admin queue. You'll see it appear once an admin approves it."
        isMobile={ctx.isMobile}
        backLabel="Back to Readings"
        backHref="/app/readings"
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 18px", borderRadius: 12,
          background: "#0f291f", border: "1px solid #1a4d2e",
          fontSize: 13, color: "#6ee7b7",
        }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          Redirecting back to readings…
        </div>
      </FormShell>
    );
  }

  const displayName = profile?.displayName ?? user?.displayName ?? "";
  const github      = profile?.github      ?? user?.github      ?? "";

  return (
    <FormShell
      title="Publish a reading"
      subtitle="Share an article, paper, video or book that helped you. Admins review every submission before it appears in the public list."
      isMobile={ctx.isMobile}
      backLabel="Back to Readings"
      backHref="/app/readings"
    >
      <PostingAs displayName={displayName} email={user?.email} github={github} />

      <form onSubmit={submit}>
        <Field label="Title" error={errors.title}>
          <input style={fieldInput} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Designing data-intensive applications: chapter 5"/>
        </Field>

        <Field label="URL (must be https)" error={errors.url}>
          <input style={fieldInput} value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://example.com/post"/>
        </Field>

        <FieldGrid isMobile={ctx.isMobile}>
          <Field label="Type" error={errors.type}>
            <select style={fieldInput} value={form.type} onChange={(e) => update("type", e.target.value)}>
              {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <Field label="Difficulty (optional)">
            <select style={fieldInput} value={form.difficulty} onChange={(e) => update("difficulty", e.target.value as typeof form.difficulty)}>
              <option value="">— pick one —</option>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </FieldGrid>

        <Field label="Topics (comma-separated, lowercase-kebab-case)" hint='e.g. "redis, caching, hld"' error={errors.topics}>
          <input style={fieldInput} value={form.topics} onChange={(e) => update("topics", e.target.value)} placeholder="redis, caching"/>
        </Field>

        <Field label="Notes (optional, one-line summary)" error={errors.notes}>
          <textarea style={{ ...fieldInput, minHeight: 70 }} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Why is this useful?"/>
        </Field>

        <FormFooter isMobile={ctx.isMobile}>
          <FormButton onClick={() => navigate("/app/readings")}>Cancel</FormButton>
          <FormButton type="submit" primary disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for review"}
          </FormButton>
        </FormFooter>
      </form>
    </FormShell>
  );
}
