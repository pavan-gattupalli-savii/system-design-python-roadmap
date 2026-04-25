// ── Submit Answer Doc page ───────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { useMyProfile } from "../hooks/useMyProfile";
import { apiFetch } from "../api/client";
import { answerDocForm, type AnswerDocForm } from "../lib/schemas";
import {
  FormShell, Field, fieldInput, FormButton, FormFooter, PostingAs,
} from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";

export default function SubmitAnswer() {
  const ctx = useOutletContext<LayoutContext>();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({ label: "", url: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof AnswerDocForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof AnswerDocForm]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = answerDocForm.safeParse(form);
    if (!parsed.success) {
      const fieldErr: Partial<Record<keyof AnswerDocForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof AnswerDocForm;
        if (k && !fieldErr[k]) fieldErr[k] = issue.message;
      }
      setErrors(fieldErr);
      return;
    }
    if (!id) return;

    setSubmitting(true);
    try {
      await apiFetch(`/api/interviews/${id}/answers`, {
        method: "POST",
        body:   JSON.stringify(parsed.data),
      });
      qc.invalidateQueries({ queryKey: ["me"] });
      setDone(true);
      setTimeout(() => navigate("/app/interview"), 1500);
    } catch (err) {
      setErrors({ label: err instanceof Error ? err.message : "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <FormShell title="Submitted" subtitle="Thanks! Your answer doc is pending review." isMobile={ctx.isMobile}>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Redirecting…</div>
      </FormShell>
    );
  }

  const displayName = profile?.displayName ?? user?.displayName ?? "";
  const github      = profile?.github      ?? user?.github      ?? "";

  return (
    <FormShell
      title={`Share an answer for question #${id}`}
      subtitle="Drop a link to a write-up, gist, video or doc that walks through your answer. Admins approve before it shows up below the question."
      isMobile={ctx.isMobile}
    >
      <PostingAs displayName={displayName} email={user?.email} github={github} />

      <form onSubmit={submit}>
        <Field label="Label" hint='e.g. "My write-up" or "Video walkthrough"' error={errors.label}>
          <input style={fieldInput} value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="My take on this question"/>
        </Field>

        <Field label="URL (https only)" error={errors.url}>
          <input style={fieldInput} value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://..."/>
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
