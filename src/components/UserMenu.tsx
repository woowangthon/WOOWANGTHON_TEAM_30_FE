"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/lib/api-types.gen";

export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  return (
    <details className="relative">
      <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-full border border-line bg-card px-3 text-sm text-ink-soft">
        {user.display_name} 님
      </summary>
      <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-card p-2 shadow-lg">
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
