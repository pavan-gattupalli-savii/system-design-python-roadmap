// ── Build submissions API ─────────────────────────────────────────────────────
import { apiFetch } from "./client";

export interface BuildSubmission {
  resourceKey: string;
  githubUrl:   string;
  notes:       string | null;
  submittedAt: string;
  updatedAt:   string;
}

export function fetchBuilds(language: "python" | "java"): Promise<BuildSubmission[]> {
  return apiFetch<BuildSubmission[]>(`/api/builds?language=${language}`);
}

export function submitBuild(
  language: "python" | "java",
  resourceKey: string,
  githubUrl: string,
  notes?: string,
): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/builds", {
    method: "POST",
    body:   JSON.stringify({ language, resourceKey, githubUrl, notes }),
  });
}

export function deleteBuild(language: "python" | "java", resourceKey: string): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>(
    `/api/builds/${encodeURIComponent(resourceKey)}?language=${language}`,
    { method: "DELETE" },
  );
}
