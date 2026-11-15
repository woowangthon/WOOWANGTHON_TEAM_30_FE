const BARS = [6, 14, 9, 18, 12, 22, 15, 10, 19, 8, 16, 11, 20, 7, 13, 17, 9, 14, 6, 11];

/** 장식용 음성 파형(실제 소리와는 관계없음). */
export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={className} aria-hidden="true">
      {BARS.map((h, i) => (
        <rect key={i} x={i * 6 + 1} y={12 - h / 2} width="3" height={h} rx="1.5" fill="currentColor" />
      ))}
    </svg>
  );
}

/** 첫 화면과 같은 따뜻한 배경 번짐. 부모에 relative isolate가 필요하다. */
export function Backdrop() {
  // 번짐 그라데이션은 쓰지 않는다(평평한 종이 바탕). 호출하는 곳을 그대로 두려고 빈 요소만 남긴다.
  return null;
}
