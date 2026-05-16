// ── Analytics API ─────────────────────────────────────────────────────────────
import { apiFetch } from "./client";
import type { Language } from "../data/roadmap-index";

export interface AnalyticsResponse {
  totals:           { done: number; total: number; pct: number };
  mins:             { done: number; total: number; remaining: number };
  byType:           Record<string, { done: number; total: number; mins: number }>;
  byPhase:          Array<{ phase: number; title: string; done: number; total: number; pct: number; mins: number; totalMins: number }>;
  velocity:         { last7d: number; last30d: number; perDay7: number };
  predictedDays:    number | null;
  streak:           number;
  lastCompletedAt:  string | null;
}

export async function fetchAnalytics(language: Language): Promise<AnalyticsResponse> {
  return apiFetch<AnalyticsResponse>(`/api/me/analytics?lang=${language}`);
}
