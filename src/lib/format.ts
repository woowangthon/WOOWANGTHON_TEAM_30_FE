export function formatBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

export function formatDuration(sec: number | null | undefined): string {
  if (sec == null) return "";
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m}분 ${r}초` : `${r}초`;
}

export function formatDateKo(iso: string | null | undefined): string {
  if (!iso) return "날짜 모름";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

/** 받침 여부에 따라 '이/가', '을/를' 같은 조사를 고른다. */
export function josa(word: string, withBatchim: string, without: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return `${word}${without}`;
  return `${word}${(last - 0xac00) % 28 ? withBatchim : without}`;
}
