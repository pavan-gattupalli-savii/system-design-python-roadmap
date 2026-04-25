// ── Generic data-fetching hook ────────────────────────────────────────────────
// Usage:
//   const { data, loading, error } = useFetch<Reading[]>("/api/readings?sort=top");

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../api/client";

export interface FetchState<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
}

export function useFetch<T>(path: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  // Track if the component is still mounted to avoid setState after unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setState({ data: null, loading: true, error: null });

    apiFetch<T>(path)
      .then((data) => {
        if (mountedRef.current) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (mountedRef.current) setState({ data: null, loading: false, error: err.message });
      });

    return () => { mountedRef.current = false; };
  }, [path]);

  return state;
}
