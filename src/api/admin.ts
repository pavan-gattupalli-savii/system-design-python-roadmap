// ── Admin API ─────────────────────────────────────────────────────────────────
import { apiFetch } from "./client";

export type AdminKind = "readings" | "interviews" | "experiences" | "answers";

export interface PendingQueue {
  readings:    PendingReading[];
  interviews:  PendingInterview[];
  experiences: PendingExperience[];
  answers:     PendingAnswerDoc[];
}

export interface PendingBase    { id: number; submittedBy: string | null; createdAt: string }
export interface PendingReading    extends PendingBase { type: string; title: string; url: string; addedBy: string; topics: string[]; difficulty: string | null; notes: string | null }
export interface PendingInterview  extends PendingBase { category: string; title: string; difficulty: string; companies: string[]; topics: string[]; hints: string[]; followUps: string[] }
export interface PendingExperience extends PendingBase { title: string; url: string; platform: string; company: string; role: string; outcome: string | null; topics: string[]; notes: string | null }
export interface PendingAnswerDoc  extends PendingBase { questionId: number; label: string; url: string; by: string }

export function fetchPending(): Promise<PendingQueue> {
  return apiFetch<PendingQueue>("/api/admin/pending");
}

export function approveItem(kind: AdminKind, id: number): Promise<{ approved: true; id: number }> {
  return apiFetch(`/api/admin/${kind}/${id}/approve`, { method: "PATCH" });
}

export function rejectItem(kind: AdminKind, id: number): Promise<{ rejected: true; id: number }> {
  return apiFetch(`/api/admin/${kind}/${id}`, { method: "DELETE" });
}
