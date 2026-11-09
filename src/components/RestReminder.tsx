"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/api-types.gen";

const KEY = "yeoun.activeMinutes";

/**
 * 오래 머물면 부드럽게 쉬어 가기를 권한다. 탓하지 않는 말투, 끌 수 있음(설정 → 마음 돌봄).
 * 화면이 보이는 동안만 시간을 센다. 같은 날 안에서 이어서 센다.
 */
export function RestReminder({ user }: { user?: User }) {
  const [show, setShow] = useState(false);
  const snoozedUntil = useRef(0);
  const enabled = user?.prefs.rest_reminder ?? true;
  const limit = user?.prefs.rest_minutes ?? 40;

  useEffect(() => {
    if (!enabled) return;
    const today = new Date().toDateString();
    const read = (): number => {
      try {
        const raw = JSON.parse(sessionStorage.getItem(KEY) || "{}");
        return raw.day === today ? Number(raw.minutes) || 0 : 0;
      } catch {
        return 0;
      }
    };
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const minutes = read() + 1;
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ day: today, minutes }));
      } catch {
        /* 저장이 막혀도 괜찮다 */
      }
      if (minutes >= limit && Date.now() > snoozedUntil.current) setShow(true);
    }, 60_000);
    return () => clearInterval(id);
  }, [enabled, limit]);

  if (!show) return null;
  return (
    <div role="dialog" aria-labelledby="rest-title" className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="card mx-auto max-w-xl border-sage/30 bg-sage-soft shadow-lg">
        <p id="rest-title" className="font-semibold text-sage">잠깐 쉬어 가도 괜찮아요</p>
        <p className="mt-1 text-ink-soft">
          오늘 오래 함께하셨네요. 물 한 잔 마시고 창밖을 잠시 보고 와도 좋아요. 추억은 여기 그대로 있을게요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="btn-ghost"
            onClick={() => {
              snoozedUntil.current = Date.now() + 30 * 60_000;
              setShow(false);
            }}
          >
            조금 더 있을게요
          </button>
          <Link className="btn-soft" href="/spaces">
            오늘은 여기까지
          </Link>
        </div>
        <p className="mt-3 text-sm text-ink-faint">이 안내는 계정 설정에서 끌 수 있어요.</p>
      </div>
    </div>
  );
}
