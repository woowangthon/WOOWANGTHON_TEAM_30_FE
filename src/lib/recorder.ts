/** 브라우저 녹음 도우미 (MediaRecorder). 크롬·안드로이드는 webm/opus, 사파리·아이폰은 mp4/aac. */

const PREFERRED = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export function pickMimeType(isSupported: (t: string) => boolean): string | undefined {
  return PREFERRED.find((t) => isSupported(t));
}

export function extensionFor(mime: string): string {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
