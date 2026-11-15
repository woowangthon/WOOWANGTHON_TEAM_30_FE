"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/api-types.gen";
import { Icon } from "./Icons";

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  return (
    <details className="group relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-full py-1 pl-1 pr-2 text-ink hover:bg-card/70 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-peach-soft to-accent-soft font-serif text-lg font-bold text-accent-strong ring-2 ring-card"
        >
          {user.display_name.slice(0, 1)}
        </span>
        <span className="hidden font-semibold sm:inline">{user.display_name} 님</span>
        <Icon name="chevron-down" size={18} className="text-ink-soft transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-line bg-card p-2 shadow-[0_18px_40px_-20px_rgba(53,47,42,0.45)]">
        <Link className="block rounded-xl px-3 py-2 hover:bg-paper" href="/spaces">내 공간 목록</Link>
        <Link className="block rounded-xl px-3 py-2 hover:bg-paper" href="/account">계정·화면 설정</Link>
        <Link className="block rounded-xl px-3 py-2 hover:bg-paper" href="/help">도움 안내</Link>
        <button
          className="block w-full rounded-xl px-3 py-2 text-left hover:bg-paper"
          onClick={async () => {
            await api.post("/auth/logout").catch(() => {});
            router.replace("/");
          }}
        >
          로그아웃
        </button>
      </div>
    </details>
  );
}
