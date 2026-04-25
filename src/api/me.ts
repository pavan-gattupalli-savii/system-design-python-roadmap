// ── Current-user API ──────────────────────────────────────────────────────────
import { apiFetch } from "./client";

export interface MyProfile {
  id:          string;
  email:       string;
  displayName: string;
  github:      string | null;
  linkedin:    string | null;
  role:        "user" | "admin";
  createdAt:   string;
  published:   { readings: number; interviews: number; experiences: number; answers: number };
  pending:     { readings: number; interviews: number; experiences: number; answers: number };
}

export interface ProgressResponse {
  language:  "python" | "java";
  completed: string[];
}

export function fetchMe(): Promise<MyProfile> {
  return apiFetch<MyProfile>("/api/me");
}

export function patchMe(payload: { displayName?: string; github?: string; linkedin?: string }): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/me", { method: "PATCH", body: JSON.stringify(payload) });
}

export function fetchProgress(language: "python" | "java"): Promise<ProgressResponse> {
  return apiFetch<ProgressResponse>(`/api/me/progress?lang=${language}`);
}

export function setProgress(language: "python" | "java", resourceKey: string, done: boolean): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/me/progress", {
    method: "POST",
    body:   JSON.stringify({ language, resourceKey, done }),
  });
}

export function resetProgress(language: "python" | "java"): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(`/api/me/progress?lang=${language}`, { method: "DELETE" });
}
