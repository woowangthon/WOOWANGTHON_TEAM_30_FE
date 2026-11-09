/**
 * 브라우저 → /api 호출 도우미.
 *
 * Render 무료 등급의 API는 15분 동안 요청이 없으면 잠든다. 깨어나는 동안에는
 * - 연결 실패, 502/503/504, 또는 JSON이 아닌 응답(Render의 로딩 HTML)이 올 수 있다.
 * 이때는 "서버를 깨우는 중이에요" 안내를 띄우고 최대 2분 동안 자동으로 다시 시도한다.
 */
import type { ErrorResponse } from "./api-types.gen";

export const WAKE_TIMEOUT_MS = 120_000;
export const CSRF_HEADER = "x-yeoun-request";

export class ApiError extends Error {
  status: number;
  code: string;
  messageKo: string;
  constructor(status: number, code: string, messageKo: string) {
    super(messageKo);
    this.status = status;
    this.code = code;
    this.messageKo = messageKo;
  }
}

export const WAKE_FAILED_MESSAGE = "서버가 아직 깨어나지 않았어요. 잠시 뒤 새로 고쳐 주세요.";

type WakeListener = (waking: boolean) => void;
const wakeListeners = new Set<WakeListener>();
let wakingCount = 0;

export function onWakeChange(fn: WakeListener): () => void {
  wakeListeners.add(fn);
  return () => wakeListeners.delete(fn);
}

function setWaking(delta: 1 | -1) {
  const before = wakingCount > 0;
  wakingCount = Math.max(0, wakingCount + delta);
  const after = wakingCount > 0;
  if (before !== after) wakeListeners.forEach((fn) => fn(after));
}

/** 응답이 '잠든 서버' 신호인지 (우리 API는 언제나 JSON 또는 204를 돌려준다). */
export function isSleepingResponse(status: number, contentType: string | null): boolean {
  if (status === 204 || status === 304) return false;
  const isJson = (contentType || "").includes("application/json");
  if (!isJson) return true; // HTML 로딩 페이지 등
  return false;
}

export function backoffMs(attempt: number): number {
  return Math.min(1500 * 2 ** attempt, 10_000);
}

export interface RequestOptions {
  method?: string;
  json?: unknown;
  body?: BodyInit;
  signal?: AbortSignal;
  /** 잠든 서버면 자동으로 다시 시도 (기본 true) */
  retryOnWake?: boolean;
}

export interface ClientDeps {
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
}

const defaultDeps: ClientDeps = {
  fetch: (...args) => fetch(...args),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  now: () => Date.now(),
};

export async function apiRequest<T>(path: string, opts: RequestOptions = {}, deps: ClientDeps = defaultDeps): Promise<T> {
  const method = opts.method || (opts.json !== undefined || opts.body ? "POST" : "GET");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (method !== "GET" && method !== "HEAD") headers[CSRF_HEADER] = "1";
  let body = opts.body;
  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  }
  const retry = opts.retryOnWake !== false;
  const deadline = deps.now() + WAKE_TIMEOUT_MS;
  let attempt = 0;
  let waking = false;
  try {
    for (;;) {
      let res: Response | null = null;
      try {
        res = await deps.fetch(`/api${path}`, {
          method,
          headers,
          body,
          credentials: "same-origin",
          cache: "no-store",
          signal: opts.signal,
        });
      } catch (e) {
        if (opts.signal?.aborted) throw e;
        res = null;
      }
      const sleeping = res === null || isSleepingResponse(res.status, res.headers.get("content-type"));
      if (sleeping) {
        if (retry && deps.now() < deadline) {
          if (!waking) {
            waking = true;
            setWaking(1);
          }
          await deps.sleep(backoffMs(attempt++));
          continue;
        }
        throw new ApiError(503, "server_waking", WAKE_FAILED_MESSAGE);
      }
      const r = res as Response;
      if (r.status === 204) return undefined as T;
      const data = await r.json();
      if (!r.ok) {
        const err = (data as ErrorResponse)?.error;
        throw new ApiError(r.status, err?.code || "unknown", err?.message_ko || "잠시 문제가 생겼어요.");
      }
      return data as T;
    }
  } finally {
    if (waking) setWaking(-1);
  }
}

export const api = {
  get: <T>(path: string, opts: RequestOptions = {}) => apiRequest<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, json?: unknown, opts: RequestOptions = {}) =>
    apiRequest<T>(path, { ...opts, method: "POST", json: json ?? {} }),
  patch: <T>(path: string, json: unknown, opts: RequestOptions = {}) =>
    apiRequest<T>(path, { ...opts, method: "PATCH", json }),
  put: <T>(path: string, json: unknown, opts: RequestOptions = {}) => apiRequest<T>(path, { ...opts, method: "PUT", json }),
  del: <T>(path: string, opts: RequestOptions = {}) => apiRequest<T>(path, { ...opts, method: "DELETE" }),
};

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.messageKo;
  return "잠시 문제가 생겼어요. 조금 뒤 다시 해 주세요.";
}

export interface UploadResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: ApiError;
}

/** 진행률이 필요한 업로드 (XMLHttpRequest). 잠든 서버면 server_waking 오류로 알린다. */
export function uploadWithProgress<T>(
  path: string,
  form: FormData,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult<T>> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api${path}`);
    xhr.setRequestHeader(CSRF_HEADER, "1");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) onProgress(ev.loaded / ev.total);
    };
    const fail = (code: string, msg: string, status = 0) =>
      resolve({ ok: false, status, error: new ApiError(status, code, msg) });
    xhr.onerror = () => fail("server_waking", "연결이 끊겼어요. 서버를 깨우는 중일 수 있어요. 다시 시도해 주세요.");
    xhr.onabort = () => fail("aborted", "올리기를 취소했어요.");
    xhr.onload = () => {
      const ct = xhr.getResponseHeader("content-type");
      if (isSleepingResponse(xhr.status, ct)) {
        fail("server_waking", "서버를 깨우는 중이에요. 잠시 뒤 다시 시도해 주세요.", xhr.status);
        return;
      }
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        fail("bad_response", "응답을 읽지 못했어요.", xhr.status);
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve({ ok: true, status: xhr.status, data: data as T });
      else {
        const err = (data as ErrorResponse)?.error;
        fail(err?.code || "unknown", err?.message_ko || "올리지 못했어요.", xhr.status);
      }
    };
    signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
}
