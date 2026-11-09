"use client";

import Link from "next/link";
import type { Space } from "@/lib/api-types.gen";
import { AskBox } from "./AskBox";
import { Notice } from "./Feedback";
import { canEdit } from "@/lib/space-context";

export function SpaceHome({ space, base }: { space: Space; base: string }) {
  const c = space.counts;
  const editable = canEdit(space);
  const steps = [
    { done: c.assets > 0, title: "자료 올리기", body: "통화 녹음, 영상, 음성 메시지, 사진을 올려요.", href: `${base}/upload` },
    { done: c.pending_voice === 0 && c.person_clips > 0, title: "목소리 확인", body: "어느 목소리가 그분인지 골라요.", href: `${base}/voices` },
    { done: false, title: "말 걸기", body: "그분이 실제로 했던 말이 돌아와요.", href: `${base}/chat` },
  ];
  return (
    <div className="space-y-6">
      {space.is_sample && (
        <Notice tone="accent">
          가상 인물로 만든 샘플 공간이에요. 실제 녹음은 아직 준비 중이라 자막과 &lsquo;샘플 녹음 준비 중&rsquo; 표시로 보여 드려요.
        </Notice>
      )}
      <AskBox base={base} personName={space.person_name} />
      {c.person_clips === 0 && editable && (
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Link href={s.href} className="card flex items-start gap-4 hover:border-accent/40">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${s.done ? "bg-sage text-white" : "bg-accent-soft text-accent-strong"}`}>
                  {s.done ? "✓" : i + 1}
                </span>
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="block text-ink-soft">{s.body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <dl className="grid grid-cols-3 gap-3 text-center">
        <div className="card p-3">
          <dt className="text-sm text-ink-soft">목소리 클립</dt>
          <dd className="text-xl font-bold">{c.person_clips}</dd>
        </div>
        <div className="card p-3">
          <dt className="text-sm text-ink-soft">사진</dt>
          <dd className="text-xl font-bold">{c.photos}</dd>
        </div>
        <div className="card p-3">
          <dt className="text-sm text-ink-soft">처리 중</dt>
          <dd className="text-xl font-bold">{c.processing}</dd>
        </div>
      </dl>
      {c.pending_voice > 0 && editable && (
        <Link href={`${base}/voices`} className="block">
          <Notice tone="accent">목소리 확인이 필요한 자료가 {c.pending_voice}개 있어요. 확인해야 대화에 쓰여요 →</Notice>
        </Link>
      )}
    </div>
  );
}
