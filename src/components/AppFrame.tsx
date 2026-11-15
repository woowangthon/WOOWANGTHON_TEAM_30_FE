"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Space } from "@/lib/api-types.gen";
import { Backdrop } from "./Wave";
import { Icon, Logo, type IconName } from "./Icons";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  sample?: boolean;
}

const NAV: NavItem[] = [
  { href: "", label: "홈", icon: "book", sample: true },
  { href: "/chat", label: "기억 대화", icon: "chat", sample: true },
  { href: "/timeline", label: "타임라인", icon: "mic", sample: true },
  { href: "/upload", label: "자료 올리기", icon: "upload" },
  { href: "/voices", label: "목소리 확인", icon: "users" },
  { href: "/ahead", label: "미리 남기기", icon: "feather" },
  { href: "/settings", label: "설정", icon: "settings" },
];

function heading(sub: string, person: string): { title: string; sub: string } {
  if (sub.startsWith("/chat")) return { title: "기억 대화", sub: `${person}에게 메시지를 보내면 그분 말투로 답장이 와요` };
  if (sub.startsWith("/timeline")) return { title: "타임라인", sub: `날짜별로 모아 둔 ${person}의 실제 목소리` };
  if (sub.startsWith("/collections")) return { title: "클립 모음", sub: "즐겨찾기로 모은 녹음을 이어서 들어요" };
  if (sub.startsWith("/upload")) return { title: "자료 올리기", sub: "통화 녹음, 영상, 음성 메시지, 사진을 모아 주세요" };
  if (sub.startsWith("/voices")) return { title: "목소리 확인", sub: `녹음마다 어느 목소리가 ${person}인지 골라 주세요` };
  if (sub.startsWith("/ahead")) return { title: "미리 남기기", sub: "질문 카드로 목소리를 미리 남겨 두어요" };
  if (sub.startsWith("/settings")) return { title: "설정", sub: "공간 정보, 가족 초대, 내보내기와 지우기" };
  return { title: "추억 공간", sub: "목소리로 다시 만나는 소중한 순간들" };
}

interface Props {
  space: Space;
  base: string;
  sample?: boolean;
  pendingVoice?: number;
  back: { href: string; label: string };
  right?: React.ReactNode;
  children: React.ReactNode;
}

/** 추억 공간 안의 틀: 왼쪽 메뉴, 위쪽 검색·사용자, 페이지 제목. 좁은 화면에서는 메뉴가 위로 올라간다. */
export function AppFrame({ space, base, sample, pendingVoice = 0, back, right, children }: Props) {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const items = NAV.filter((n) => !sample || n.sample);
  const sub = path.slice(base.length);
  const isHome = sub === "" || sub === "/";
  const h = heading(sub, space.person_name);

  const isActive = (n: NavItem) => (n.href === "" ? isHome : sub.startsWith(n.href) || (n.href === "/timeline" && sub.startsWith("/collections")));

  return (
    <div className="relative isolate min-h-dvh lg:pl-[15.5rem]">
      <Backdrop />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col overflow-hidden border-r border-line/70 bg-paper-deep/70 px-4 pb-6 pt-8 lg:flex">
        <Link href={base} className="px-3" aria-label="공간 홈">
          <Logo />
        </Link>
        <nav aria-label="공간 메뉴" className="mt-10">
          <ul className="space-y-1">
            {items.map((n) => {
              const active = isActive(n);
              return (
                <li key={n.href}>
                  <Link
                    href={`${base}${n.href}`}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[1.02rem] transition-colors ${
                      active ? "bg-accent-soft font-semibold text-ink" : "text-ink-soft hover:bg-card/70 hover:text-ink"
                    }`}
                  >
                    <Icon name={n.icon} size={21} className={active ? "text-accent-strong" : ""} />
                    <span>{n.label}</span>
                    {n.href === "/voices" && pendingVoice > 0 && (
                      <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-peach px-1.5 text-xs font-semibold text-white">{pendingVoice}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="relative z-10 mt-8 border-t border-line/70 pt-5">
          <p className="px-2 text-xs text-ink-faint">{sample ? "샘플 공간 · 가상 인물" : "지금 보는 공간"}</p>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-card/80 px-3 py-3">
            <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft font-serif text-lg font-bold text-accent-strong">
              {space.person_name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <h2 className="truncate font-serif text-[1.05rem] font-bold leading-tight">{space.name}</h2>
              <span className="text-xs text-ink-soft">목소리 {space.counts.person_clips}개 · 자료 {space.counts.assets}개</span>
            </span>
          </div>
          <Link href={back.href} className="mt-3 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm text-ink-soft hover:text-ink">
            ← {back.label}
          </Link>
        </div>
        {/* 아래쪽 잎 그림자 그림. 파일이 없으면 숨긴다(design/image-prompts.md의 sidebar-leaves) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/sidebar-leaves.webp"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-70 mix-blend-multiply [mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </aside>

      <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/80 backdrop-blur lg:border-none lg:bg-paper/60">
        <div className="flex h-16 items-center gap-3 px-4 lg:h-[5.5rem] lg:px-10">
          <Link href={base} className="lg:hidden" aria-label="공간 홈">
            <Logo className="scale-90" />
          </Link>
          <form
            role="search"
            className="ml-auto hidden w-full max-w-md items-center gap-3 rounded-2xl border border-line bg-card/90 px-4 focus-within:border-accent md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              const v = q.trim();
              router.push(`${base}/timeline${v ? `?q=${encodeURIComponent(v)}` : ""}`);
            }}
          >
            <Icon name="search" size={20} className="shrink-0 text-ink-soft" />
            <label htmlFor="frame-search" className="sr-only">녹음 속 말 찾기</label>
            <input
              id="frame-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="기억, 장면, 말 속에서 찾아보기…"
              className="h-12 w-full bg-transparent text-[0.98rem] placeholder:text-ink-faint focus:outline-none"
            />
          </form>
          <span aria-hidden className="mx-2 hidden h-7 w-px bg-line md:block" />
          <div className="ml-auto flex items-center gap-2 md:ml-0">{right}</div>
        </div>
        <nav aria-label="공간 메뉴" className="overflow-x-auto px-4 pb-3 lg:hidden">
          <ul className="flex gap-2 whitespace-nowrap">
            {items.map((n) => {
              const active = isActive(n);
              return (
                <li key={n.href}>
                  <Link
                    href={`${base}${n.href}`}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[0.95rem] ${
                      active ? "bg-accent-strong text-white" : "border border-line bg-card/80 text-ink-soft"
                    }`}
                  >
                    <Icon name={n.icon} size={17} />
                    {n.label}
                    {n.href === "/voices" && pendingVoice > 0 && <span className="rounded-full bg-peach px-1.5 text-xs text-white">{pendingVoice}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="px-4 pb-24 pt-4 lg:px-10 lg:pt-2">
        <div className={isHome ? "sr-only" : sub.startsWith("/chat") ? "mb-4 lg:mb-8" : "mb-8"}>
          <h1 className={`font-serif font-bold leading-tight lg:text-[2.4rem] ${sub.startsWith("/chat") ? "text-[1.5rem]" : "text-[1.9rem]"}`}>{h.title}</h1>
          <p className={`mt-1.5 text-ink-soft lg:text-lg ${sub.startsWith("/chat") ? "hidden sm:block" : ""}`}>{h.sub}</p>
        </div>
        <div className={isHome ? "max-w-[88rem]" : "max-w-3xl"}>{children}</div>
      </main>
    </div>
  );
}
