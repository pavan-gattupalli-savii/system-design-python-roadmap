import { useState, useCallback } from "react";
import { STORAGE_KEY } from "../constants/app";

interface ProgressHook {
  completed: Set<string>;
  toggle: (id: string) => void;
  reset: () => void;
}

/** Manages per-resource completion state backed by localStorage. */
export function useProgress(): ProgressHook {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return new Set<string>(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set<string>();
    }
  });

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCompleted(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { completed, toggle, reset };
}
