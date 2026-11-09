import Link from "next/link";

interface ShellProps {
  children: React.ReactNode;
  back?: { href: string; label: string };
  wide?: boolean;
  right?: React.ReactNode;
}

/** 모든 화면의 바깥 틀: 위쪽 로고·뒤로 가기, 가운데 정렬된 본문. */
export function Shell({ children, back, wide, right }: ShellProps) {
  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className={`mx-auto flex h-14 items-center gap-3 px-4 ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
          {back ? (
            <Link href={back.href} className="-ml-2 rounded-xl px-2 py-2 text-ink-soft hover:text-ink" aria-label={`${back.label}(으)로 돌아가기`}>
              ← {back.label}
            </Link>
          ) : (
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-ink">
              여운
            </Link>
          )}
          <div className="ml-auto flex items-center gap-2">{right}</div>
        </div>
      </header>
      <main className={`mx-auto px-4 pt-6 ${wide ? "max-w-4xl" : "max-w-2xl"}`}>{children}</main>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-2xl font-bold leading-snug">{title}</h1>
      {sub && <p className="mt-2 text-ink-soft">{sub}</p>}
    </div>
  );
}
