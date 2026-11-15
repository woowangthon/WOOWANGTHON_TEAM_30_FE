"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useApi, useMe } from "@/lib/hooks";
import type { Space } from "@/lib/api-types.gen";
import { SpaceContext } from "@/lib/space-context";
import { Shell } from "@/components/Shell";
import { AppFrame } from "@/components/AppFrame";
import { UserMenu } from "@/components/UserMenu";
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

  if (space.error || !space.data) {
    return (
      <Shell back={{ href: "/spaces", label: "내 공간" }}>
        {space.error ? (
          <ErrorBox message={space.error.status === 404 ? "공간을 찾을 수 없어요. 권한이 없거나 지워진 공간이에요." : space.error.messageKo} onRetry={space.reload} />
        ) : (
          <Spinner />
        )}
      </Shell>
    );
  }

  const base = `/spaces/${id}`;
  return (
    <SpaceContext.Provider value={{ space: space.data, reload: space.reload, base }}>
      <AppFrame
        space={space.data}
        base={base}
        pendingVoice={space.data.counts.pending_voice}
        back={{ href: "/spaces", label: "내 공간 목록" }}
        right={me.data && <UserMenu user={me.data} />}
      >
        {children}
      </AppFrame>
      <RestReminder user={me.data} />
    </SpaceContext.Provider>
  );
}
