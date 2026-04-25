// ── useRoadmap hook ────────────────────────────────────────────────────────────
// Returns roadmap phases for the given language.
// Strategy: start with the bundled static data (instant), then background-fetch
// from the API and swap in fresh DB data if the request succeeds.
// Falls back silently to the static data on any network error.

import { useState, useEffect } from "react";
import { ROADMAPS } from "../data/roadmap-index";
import type { Language } from "../data/roadmap-index";
import type { Phase } from "../data/models";
import { fetchRoadmap } from "../api/roadmap";

export function useRoadmap(lang: Language): Phase[] {
  const [phases, setPhases] = useState<Phase[]>(ROADMAPS[lang]);

  // When language changes, immediately restore the static snapshot
  useEffect(() => {
    setPhases(ROADMAPS[lang]);
  }, [lang]);

  // Then try to hydrate from API in the background
  useEffect(() => {
    let cancelled = false;
    fetchRoadmap(lang)
      .then((data) => {
        if (!cancelled && data.length > 0) setPhases(data);
      })
      .catch(() => {
        // Silently keep the static data — no error UI needed here
      });
    return () => { cancelled = true; };
  }, [lang]);

  return phases;
}
