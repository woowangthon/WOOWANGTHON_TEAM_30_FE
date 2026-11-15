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
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(50rem_24rem_at_10%_-10%,var(--color-accent-soft),transparent_70%),radial-gradient(36rem_22rem_at_100%_0%,var(--color-sage-soft),transparent_70%)]"
    />
  );
}
