import Link from "next/link";
import { Backdrop } from "./Wave";
import { Icon, Logo } from "./Icons";

interface Props {
  title: string;
  sub?: React.ReactNode;
  back?: { href: string; label: string };
  children: React.ReactNode;
}

/** 로그인·가입·초대 화면의 틀: 왼쪽 그림 판, 오른쪽 양식 카드. 좁은 화면에서는 양식만. */
export function AuthFrame({ title, sub, back, children }: Props) {
  return (
    <div className="relative isolate min-h-dvh">
      <Backdrop />
      <div className="mx-auto grid min-h-dvh max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:py-10">
        <aside className="relative hidden overflow-hidden rounded-[2rem] border border-line shadow-[0_30px_60px_-40px_rgba(53,47,42,0.6)] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/auth-side.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1e1f24]/70 via-[#1e1f24]/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 p-8">
            <Link href="/" aria-label="여운 처음 화면" className="inline-block rounded-2xl bg-card/85 px-4 py-2 backdrop-blur">
              <Logo />
            </Link>
          </div>
          <figure className="absolute inset-x-0 bottom-0 p-9 text-white">
            <blockquote className="font-serif text-[1.55rem] font-bold leading-snug">
              “우리 강아지, 밥은 묵었나?”
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2 text-sm text-white/85">
              <Icon name="mic" size={16} />
              그분이 남긴 말은 그 목소리 그대로 · 예시 문장
            </figcaption>
          </figure>
        </aside>

        <main className="flex flex-col">
          <div className="flex h-12 items-center">
            <Link href="/" className="lg:hidden" aria-label="여운 처음 화면">
              <Logo className="scale-90" />
            </Link>
            {back && (
              <Link href={back.href} className="ml-auto rounded-xl px-2 py-2 text-ink-soft hover:text-ink">
                ← {back.label}
              </Link>
            )}
          </div>
          <div className="flex flex-1 items-center py-8">
            <div className="w-full rounded-[1.6rem] border border-line bg-card/95 p-6 shadow-[0_22px_48px_-32px_rgba(53,47,42,0.55)] sm:p-9">
              <h1 className="border-l-[3px] border-accent pl-4 font-serif text-[1.8rem] font-bold leading-snug">{title}</h1>
              {sub && <p className="mt-2 pl-[1.2rem] text-ink-soft">{sub}</p>}
              <div className="mt-7">{children}</div>
            </div>
          </div>
          <p className="flex items-center justify-center gap-2 pb-2 text-sm text-ink-faint">
            <Icon name="lock" size={15} />
            올린 분과 초대한 가족만 볼 수 있어요
          </p>
        </main>
      </div>
    </div>
  );
}
