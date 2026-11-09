/** 업로드 대기열 규칙 (화면과 분리해 테스트한다). */

export type QueueStatus = "waiting" | "uploading" | "done" | "error" | "rejected";

export interface QueueItem {
  key: string;
  name: string;
  size: number;
  status: QueueStatus;
  progress: number;
  message?: string;
}

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** 올리기 전에 형식·크기를 확인한다. 문제가 있으면 한국어 이유를 돌려준다. */
export function precheck(name: string, size: number, allowed: string[], maxMb: number): string | null {
  const ext = extOf(name);
  if (!allowed.includes(ext)) return `이 형식(.${ext || "?"})은 올릴 수 없어요.`;
  if (size === 0) return "빈 파일이에요.";
  if (size > maxMb * 1024 * 1024) return `파일 하나는 ${maxMb}MB까지 올릴 수 있어요.`;
  return null;
}

/** 다음에 올릴 항목들 (동시에 limit개까지). */
export function nextToStart(items: QueueItem[], limit = 2): QueueItem[] {
  const running = items.filter((i) => i.status === "uploading").length;
  return items.filter((i) => i.status === "waiting").slice(0, Math.max(0, limit - running));
}
