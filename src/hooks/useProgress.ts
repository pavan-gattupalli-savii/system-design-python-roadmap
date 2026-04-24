import { useState, useCallback } from "react";
import { STORAGE_KEY } from "../constants/app";

interface ProgressHook {
  completed: Set<string>;
  toggle: (id: string) => void;
  reset: () => void;
}

/** Manages per-resource completion state backed by sessionStorage.
 *  Progress resets on page refresh or when the tab is closed.
 *  This prevents confusion when multiple people share the same device.
 *  Future: replace sessionStorage with a user-auth-backed API call.
 */
export function useProgress(): ProgressHook {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return new Set<string>(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set<string>();
    }
  });

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCompleted(new Set());
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { completed, toggle, reset };
}
