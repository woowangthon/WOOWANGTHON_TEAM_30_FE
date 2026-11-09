/** 이 기기에만 저장하는 화면 설정. 계정 설정(prefs)과 함께 쓴다. */

const TEXT_KEY = "yeoun.textSize";

export type TextSize = "normal" | "large";

export function readTextSize(): TextSize {
  try {
    return localStorage.getItem(TEXT_KEY) === "large" ? "large" : "normal";
  } catch {
    return "normal";
  }
}

export function applyTextSize(size: TextSize) {
  if (typeof document === "undefined") return;
  if (size === "large") document.documentElement.dataset.text = "large";
  else delete document.documentElement.dataset.text;
}

export function saveTextSize(size: TextSize) {
  try {
    localStorage.setItem(TEXT_KEY, size);
  } catch {
    /* 저장이 막혀 있어도 화면에는 적용 */
  }
  applyTextSize(size);
}
