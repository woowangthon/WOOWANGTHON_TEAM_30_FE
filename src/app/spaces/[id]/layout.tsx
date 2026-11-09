"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useApi, useMe } from "@/lib/hooks";
import type { Space } from "@/lib/api-types.gen";
import { SpaceContext } from "@/lib/space-context";
import { Shell } from "@/components/Shell";
import { SpaceNav } from "@/components/SpaceNav";
import { ErrorBox, Spinner } from "@/components/Feedback";
import { RestReminder } from "@/components/RestReminder";

export default function SpaceLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const me = useMe(true);
  const space = useApi<Space>(me.data ? `/spaces/${id}` : null);
  const pathname = usePathname();
  const { reload } = space;
  // 탭을 옮길 때마다 개수(처리 중, 목소리 확인 대기 등)를 새로 받는다
  useEffect(() => {
    if (me.data) void reload();
  }, [pathname, me.data, reload]);

  return (
    <Shell back={{ href: "/spaces", label: "내 공간" }}>
      {space.error ? (
        <ErrorBox message={space.error.status === 404 ? "공간을 찾을 수 없어요. 권한이 없거나 지워진 공간이에요." : space.error.messageKo} onRetry={space.reload} />
      ) : !space.data ? (
        <Spinner />
      ) : (
        <SpaceContext.Provider value={{ space: space.data, reload: space.reload, base: `/spaces/${id}` }}>
          <div className="mb-4">
            <p className="text-sm text-ink-faint">추억 공간</p>
            <h1 className="font-serif text-2xl font-bold">{space.data.name}</h1>
          </div>
          <SpaceNav spaceId={id} pendingVoice={space.data.counts.pending_voice} />
          {children}
          <RestReminder user={me.data} />
        </SpaceContext.Provider>
      )}
    </Shell>
  );
}
