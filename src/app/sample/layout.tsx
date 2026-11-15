"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks";
import type { AppConfig, Space } from "@/lib/api-types.gen";
import { SpaceContext } from "@/lib/space-context";
import { Shell } from "@/components/Shell";
import { AppFrame } from "@/components/AppFrame";
import { ErrorBox, Spinner } from "@/components/Feedback";

/** 가입 없이 체험하는 샘플 공간 (읽기 전용). */
export default function SampleLayout({ children }: { children: React.ReactNode }) {
  const config = useApi<AppConfig>("/config");
  const sampleId = config.data?.sample_space_id;
  const space = useApi<Space>(sampleId ? `/spaces/${sampleId}` : null);

  if (space.data) {
    return (
      <SpaceContext.Provider value={{ space: space.data, reload: space.reload, base: "/sample" }}>
        <AppFrame
          space={space.data}
          base="/sample"
          sample
          back={{ href: "/", label: "처음으로" }}
          right={
            <Link href="/signup" className="inline-flex min-h-11 items-center rounded-full bg-accent-strong px-5 text-[0.95rem] font-semibold text-white hover:bg-accent">
              내 공간 만들기
            </Link>
          }
        >
          {children}
        </AppFrame>
      </SpaceContext.Provider>
    );
  }

  let body: React.ReactNode;
  if (config.error || space.error) body = <ErrorBox message={(config.error || space.error)!.messageKo} onRetry={() => { void config.reload(); void space.reload(); }} />;
  else if (config.data && !sampleId) body = <ErrorBox message="샘플 공간이 아직 준비되지 않았어요. 관리자가 make seed를 실행해야 해요." />;
  else body = <Spinner />;

  return <Shell back={{ href: "/", label: "처음으로" }}>{body}</Shell>;
}
