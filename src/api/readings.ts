// ── Readings API ──────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Reading } from "../data/readings";

export interface ReadingsResponse {
  data:  Reading[];
  page:  number;
  limit: number;
}

export function buildReadingsUrl(params: {
  type?: string; difficulty?: string; topic?: string;
  sort?: string; page?: number; limit?: number;
}): string {
  const q = new URLSearchParams();
  if (params.type)       q.set("type",       params.type);
  if (params.difficulty) q.set("difficulty",  params.difficulty);
  if (params.topic)      q.set("topic",       params.topic);
  if (params.sort)       q.set("sort",        params.sort);
  if (params.page)       q.set("page",        String(params.page));
  if (params.limit)      q.set("limit",       String(params.limit));
  return `/api/readings${q.size ? "?" + q.toString() : ""}`;
}

export async function upvoteReading(id: string): Promise<{ upvotes: number }> {
  return apiFetch(`/api/readings/${id}/upvote`, { method: "POST" });
}

export async function submitReading(payload: {
  type: string; title: string; url: string; addedBy: string;
  githubUser?: string; topics: string[]; difficulty?: string; notes?: string;
}): Promise<{ message: string }> {
  return apiFetch("/api/readings/submit", { method: "POST", body: JSON.stringify(payload) });
}
