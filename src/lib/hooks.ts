"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "./api";
import type { User } from "./api-types.gen";

export interface ApiState<T> {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => Promise<void>;
  setData: (d: T) => void;
}

/** GET 요청 상태. path가 null이면 부르지 않는다. */
export function useApi<T>(path: string | null): ApiState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<ApiError>();
  const [loading, setLoading] = useState(Boolean(path));
  const current = useRef(path);
  current.current = path;

  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const d = await api.get<T>(path);
      if (current.current === path) {
        setData(d);
        setError(undefined);
      }
    } catch (e) {
      if (current.current === path) setError(e instanceof ApiError ? e : new ApiError(0, "unknown", "불러오지 못했어요."));
    } finally {
      if (current.current === path) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, reload: load, setData };
}

/** 로그인한 사용자. required면 로그인 화면으로 보낸다. */
export function useMe(required = true): ApiState<User> {
  const router = useRouter();
  const state = useApi<User>("/me");
  useEffect(() => {
    if (required && state.error?.status === 401) {
      const next = typeof window !== "undefined" ? window.location.pathname : "/spaces";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [required, state.error, router]);
  return state;
}

/** 주기적으로 다시 불러오기 (처리 상태 등). */
export function usePolling(fn: () => void, ms: number, active: boolean) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [ms, active]);
}
