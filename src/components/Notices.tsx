"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { NoticeList } from "@/lib/api-types.gen";

/** 생일·기일·지난해 오늘 알림 (서버가 밤 10시~아침 8시에는 보내지 않는다). */
export function Notices() {
  const list = useApi<NoticeList>("/notices");
  if (!list.data || list.data.notices.length === 0) return null;
  return (
    <ul className="mb-6 space-y-2" aria-label="알림">
      {list.data.notices.map((n) => (
        <li key={n.id} className="flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-soft px-4 py-3">
          <Link href={n.kind === "on_this_day" ? `/spaces/${n.space_id}/timeline` : `/spaces/${n.space_id}`} className="flex-1">
            <span className="block font-semibold text-accent-strong">{n.title}</span>
            <span className="block text-[0.95rem] text-ink-soft">{n.message}</span>
          </Link>
          <button
            className="min-h-10 px-2 text-ink-faint"
            aria-label="알림 닫기"
            onClick={async () => {
              await api.post(`/notices/${encodeURIComponent(n.id)}/dismiss`).catch(() => {});
              void list.reload();
            }}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
