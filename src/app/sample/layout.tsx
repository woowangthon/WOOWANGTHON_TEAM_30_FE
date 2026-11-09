"use client";

import Link from "next/link";
import { useApi } from "@/lib/hooks";
import type { AppConfig, Space } from "@/lib/api-types.gen";
import { SpaceContext } from "@/lib/space-context";
import { Shell } from "@/components/Shell";
import { SpaceNav } from "@/components/SpaceNav";
import { ErrorBox, Spinner } from "@/components/Feedback";

/** 가입 없이 체험하는 샘플 공간 (읽기 전용). */
export default function SampleLayout({ children }: { children: React.ReactNode }) {
  const config = useApi<AppConfig>("/config");
  const sampleId = config.data?.sample_space_id;
  const space = useApi<Space>(sampleId ? `/spaces/${sampleId}` : null);

  let body: React.ReactNode;
  if (config.error || space.error) body = <ErrorBox message={(config.error || space.error)!.messageKo} onRetry={() => { void config.reload(); void space.reload(); }} />;
  else if (config.data && !sampleId) body = <ErrorBox message="샘플 공간이 아직 준비되지 않았어요. 관리자가 make seed를 실행해야 해요." />;
  else if (!space.data) body = <Spinner />;
  else
    body = (
      <SpaceContext.Provider value={{ space: space.data, reload: space.reload, base: "/sample" }}>
        <div className="mb-4">
          <p className="text-sm text-ink-faint">샘플 공간 · 가상 인물</p>
          <h1 className="font-serif text-2xl font-bold">{space.data.name}</h1>
        </div>
        <SpaceNav spaceId={space.data.id} sample />
        {children}
      </SpaceContext.Provider>
    );

  return (
    <Shell back={{ href: "/", label: "처음으로" }} right={<Link href="/signup" className="rounded-full bg-ink px-4 py-2 text-sm text-paper">내 공간 만들기</Link>}>
      {body}
    </Shell>
  );
}
