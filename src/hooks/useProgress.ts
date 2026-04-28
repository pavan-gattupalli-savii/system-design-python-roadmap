// ── useProgress — per-language roadmap progress ──────────────────────────────
// Behaviour:
//   - signed out → state lives in localStorage (per language), survives refresh
//   - signed in  → state mirrors `/api/me/progress` (server-backed),
//                  and any localStorage entries are migrated to the server
//                  on first sign-in for the user.

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Language } from "../data/roadmap-index";
import { fetchProgress, resetProgress, setProgress } from "../api/me";
import { useAuth } from "../lib/auth";

const storageKey = (lang: Language) => `sd-progress-${lang}-v2`;

function loadLocal(lang: Language): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(lang));
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveLocal(lang: Language, set: Set<string>) {
  try {
    localStorage.setItem(storageKey(lang), JSON.stringify([...set]));
  } catch {
    // localStorage may be unavailable in private mode — ignore.
  }
}

interface ProgressApi {
  completed: Set<string>;
  toggle:    (key: string) => void;
  reset:     () => void;
}

export function useProgress(lang: Language): ProgressApi {
  const { user } = useAuth();
  const qc       = useQueryClient();

  // Local-first: always available, even when signed out or offline.
  const [local, setLocal] = useState<Set<string>>(() => loadLocal(lang));

  useEffect(() => {
    setLocal(loadLocal(lang));
  }, [lang]);

  // Server progress, only fetched when signed in.
  const serverQuery = useQuery({
    queryKey: ["progress", user?.id, lang],
    queryFn:  () => fetchProgress(lang),
    enabled:  !!user,
    staleTime: 30_000,
  });

  // Merge: signed in → union of server + local; signed out → local only.
  const completed = (() => {
    if (!user) return local;
    const merged = new Set<string>(local);
    serverQuery.data?.completed.forEach((k) => merged.add(k));
    return merged;
  })();

  // One-time migration: when the user signs in, push any local-only keys to
  // the server so they keep their progress across devices.
  useEffect(() => {
    if (!user || !serverQuery.data) return;
    const remote = new Set(serverQuery.data.completed);
    const localOnly = [...local].filter((k) => !remote.has(k));
    if (localOnly.length === 0) return;
    Promise.allSettled(localOnly.map((k) => setProgress(lang, k, true)))
      .then(() => qc.invalidateQueries({ queryKey: ["progress", user.id, lang] }));
    // We intentionally only run this once per server fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, serverQuery.data, lang]);

  const toggle = useCallback((key: string) => {
    const isDone = completed.has(key);
    const next = new Set(local);
    if (isDone) next.delete(key); else next.add(key);
    setLocal(next);
    saveLocal(lang, next);

    if (user) {
      setProgress(lang, key, !isDone)
        .then(() => qc.invalidateQueries({ queryKey: ["progress", user.id, lang] }))
        .catch(() => { /* keep local update */ });
    }
  }, [completed, local, lang, user, qc]);

  const reset = useCallback(() => {
    setLocal(new Set());
    saveLocal(lang, new Set());
    if (user) {
      resetProgress(lang)
        .then(() => qc.invalidateQueries({ queryKey: ["progress", user.id, lang] }))
        .catch(() => { /* ignore */ });
    }
  }, [lang, user, qc]);

  return { completed, toggle, reset };
}
