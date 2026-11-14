"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "", label: "홈" },
  { href: "/book", label: "기억책" },
  { href: "/chat", label: "대화" },
  { href: "/timeline", label: "타임라인" },
  { href: "/upload", label: "자료" },
  { href: "/voices", label: "목소리 확인" },
  { href: "/ahead", label: "미리 남기기" },
  { href: "/settings", label: "설정" },
];

/** 추억 공간 안의 메뉴. 샘플 공간은 체험용 메뉴만 보인다. */
export function SpaceNav({ spaceId, sample, pendingVoice }: { spaceId: string; sample?: boolean; pendingVoice?: number }) {
  const path = usePathname();
  const base = sample ? `/sample` : `/spaces/${spaceId}`;
  const tabs = sample ? TABS.filter((t) => ["", "/book", "/chat", "/timeline"].includes(t.href)) : TABS;
  return (
    <nav aria-label="공간 메뉴" className="-mx-4 mb-6 overflow-x-auto px-4">
      <ul className="flex gap-2 whitespace-nowrap">
        {tabs.map((t) => {
          const href = `${base}${t.href}`;
          const active = t.href === "" ? path === base : path.startsWith(href);
          return (
            <li key={t.href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-[0.95rem] ${
                  active ? "bg-ink text-paper" : "border border-line bg-card text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
                {t.href === "/voices" && pendingVoice ? (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 text-xs text-white">{pendingVoice}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
