import type { ReactNode } from "react";

export function Spinner({ label = "불러오는 중이에요" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-8 text-ink-soft">
      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" aria-hidden />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-alert/30 bg-alert-soft px-4 py-3 text-alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-semibold underline underline-offset-4">
          다시 시도
        </button>
      )}
    </div>
  );
}

export function Notice({ children, tone = "guide" }: { children: ReactNode; tone?: "guide" | "sage" | "accent" }) {
  const cls = {
    guide: "bg-guide-soft text-guide border-guide/20",
    sage: "bg-sage-soft text-sage border-sage/20",
    accent: "bg-accent-soft text-accent-strong border-accent/20",
  }[tone];
  return <div className={`rounded-2xl border px-4 py-3 text-[0.95rem] ${cls}`}>{children}</div>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card text-center">
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-2 text-ink-soft">{children}</div>}
    </div>
  );
}
