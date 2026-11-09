"use client";

import { useEffect, useState } from "react";
import { api, onWakeChange } from "@/lib/api";

/** 잠든 API 서버를 깨우는 동안 위쪽에 띄우는 안내. 첫 화면에서 /api/health로 미리 깨운다. */
export function WakeBanner() {
  const [waking, setWaking] = useState(false);
  useEffect(() => {
    const off = onWakeChange(setWaking);
    api.get("/health").catch(() => {});
    return () => {
      off();
    };
  }, []);
  if (!waking) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-guide px-4 py-3 text-center text-sm text-white"
    >
      <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-white" aria-hidden />
      서버를 깨우는 중이에요. 처음 한 번은 1분쯤 걸릴 수 있어요.
    </div>
  );
}
