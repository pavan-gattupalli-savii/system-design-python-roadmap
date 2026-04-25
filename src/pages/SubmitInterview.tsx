// ── Submit Interview Question page ───────────────────────────────────────────
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { useMyProfile } from "../hooks/useMyProfile";
import { CATEGORIES, COMPANIES } from "../data/interviews";
import { apiFetch } from "../api/client";
import { interviewForm, type InterviewForm } from "../lib/schemas";
import {
  FormShell, Field, FieldGrid, fieldInput, FormButton, FormFooter, PostingAs,
} from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";

export default function SubmitInterview() {
  const ctx = useOutletContext<LayoutContext>();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    category:   "System Design",
    title:      "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    companies:  "",
    topics:     "",
    hints:      "",
    followUps:  "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InterviewForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof InterviewForm]) {
      setErrors((e) => ({ ...e, [k]: undefined }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
    const csv   = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

    const payload = {
      category:   form.category,
      title:      form.title,
      difficulty: form.difficulty,
      companies:  csv(form.companies),
      topics:     csv(form.topics),
      hints:      lines(form.hints),
      followUps:  lines(form.followUps),
    };

    const parsed = interviewForm.safeParse(payload);
    if (!parsed.success) {
      const fieldErr: Partial<Record<keyof InterviewForm, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof InterviewForm;
        if (k && !fieldErr[k]) fieldErr[k] = issue.message;
      }
      setErrors(fieldErr);
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch("/api/interviews/submit", {
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
      <FormShell title="Submitted" subtitle="Thanks! Your question is now in the admin queue." isMobile={ctx.isMobile}>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Redirecting…</div>
      </FormShell>
    );
  }

  const displayName = profile?.displayName ?? user?.displayName ?? "";
  const github      = profile?.github      ?? user?.github      ?? "";

  return (
    <FormShell
      title="Suggest an interview question"
      subtitle="Share a question that tripped you up — admins will review it before it goes live."
      isMobile={ctx.isMobile}
    >
      <PostingAs displayName={displayName} email={user?.email} github={github} />

      <form onSubmit={submit}>
        <Field label="Question (write it the way an interviewer would ask)" error={errors.title}>
          <textarea style={{ ...fieldInput, minHeight: 70 }} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder='Design a distributed rate limiter for an API gateway.'/>
        </Field>

        <FieldGrid isMobile={ctx.isMobile}>
          <Field label="Category">
            <select style={fieldInput} value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Difficulty">
            <select style={fieldInput} value={form.difficulty} onChange={(e) => update("difficulty", e.target.value as typeof form.difficulty)}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </Field>
        </FieldGrid>

        <Field label="Companies known to ask this (comma-separated)" hint={`e.g. ${COMPANIES.slice(0,3).join(", ")}`}>
          <input style={fieldInput} value={form.companies} onChange={(e) => update("companies", e.target.value)} placeholder="Amazon, Google"/>
        </Field>

        <Field label="Topics (comma-separated, lowercase-kebab)" error={errors.topics}>
          <input style={fieldInput} value={form.topics} onChange={(e) => update("topics", e.target.value)} placeholder="hld, rate-limiting"/>
        </Field>

        <Field label="Key hints (one per line — these are the points a strong answer covers)" error={errors.hints}>
          <textarea style={{ ...fieldInput, minHeight: 110 }} value={form.hints} onChange={(e) => update("hints", e.target.value)} placeholder={"Estimate scale\nDecide on token-bucket vs leaky-bucket\nCover distributed sync (Redis vs gossip)"}/>
        </Field>

        <Field label="Follow-up questions (one per line, optional)">
          <textarea style={{ ...fieldInput, minHeight: 70 }} value={form.followUps} onChange={(e) => update("followUps", e.target.value)} placeholder={"How would you handle traffic spikes?\nHow do you prevent abuse from a single tenant?"}/>
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
