// ── Interviews API ────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { InterviewQ, InterviewExp } from "../data/interviews";

export interface InterviewsResponse  { data: InterviewQ[];   page: number; limit: number; }
export interface ExperiencesResponse { data: InterviewExp[]; page: number; limit: number; }

export function buildInterviewsUrl(params: {
  category?: string; difficulty?: string; company?: string;
  sort?: string; page?: number; limit?: number;
}): string {
  const q = new URLSearchParams();
  if (params.category)   q.set("category",   params.category);
  if (params.difficulty) q.set("difficulty",  params.difficulty);
  if (params.company)    q.set("company",     params.company);
  if (params.sort)       q.set("sort",        params.sort);
  if (params.page)       q.set("page",        String(params.page));
  if (params.limit)      q.set("limit",       String(params.limit));
  return `/api/interviews${q.size ? "?" + q.toString() : ""}`;
}

export function buildExperiencesUrl(params: {
  platform?: string; company?: string; outcome?: string;
  sort?: string; page?: number; limit?: number;
}): string {
  const q = new URLSearchParams();
  if (params.platform)   q.set("platform",   params.platform);
  if (params.company)    q.set("company",     params.company);
  if (params.outcome)    q.set("outcome",     params.outcome);
  if (params.sort)       q.set("sort",        params.sort);
  if (params.page)       q.set("page",        String(params.page));
  if (params.limit)      q.set("limit",       String(params.limit));
  return `/api/experiences${q.size ? "?" + q.toString() : ""}`;
}

export async function upvoteExperience(id: string): Promise<{ upvotes: number }> {
  return apiFetch(`/api/experiences/${id}/upvote`, { method: "POST" });
}

export async function submitAnswerDoc(questionId: string, payload: {
  label: string; url: string; by: string;
}): Promise<{ message: string }> {
  return apiFetch(`/api/interviews/${questionId}/answers`, { method: "POST", body: JSON.stringify(payload) });
}
