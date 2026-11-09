"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Collection, CollectionList } from "@/lib/api-types.gen";
import { useSpace } from "@/lib/space-context";
import { ClipCardView } from "@/components/ClipCardView";
import { Empty, Spinner } from "@/components/Feedback";

function CollectionView({ id, spaceId, personName, onDeleted, editable }: { id: string; spaceId: string; personName: string; onDeleted: () => void; editable: boolean }) {
  const col = useApi<Collection>(`/spaces/${spaceId}/collections/${id}`);
  const [playing, setPlaying] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  if (!col.data) return <Spinner />;
  const clips = col.data.clips || [];

  const playFrom = (i: number) => {
    audio.current?.pause();
    const c = clips[i];
    if (!c) {
      setPlaying(null);
      return;
    }
    setPlaying(i);
    if (c.audio_status !== "ready" || !c.audio_url) {
      setTimeout(() => playFrom(i + 1), 4000);
      return;
    }
    const a = new Audio(c.audio_url);
    audio.current = a;
    a.onended = () => setTimeout(() => playFrom(i + 1), 800);
    a.play().catch(() => setPlaying(null));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => (playing === null ? playFrom(0) : (audio.current?.pause(), setPlaying(null)))}>
          {playing === null ? "▶ 모두 이어 듣기" : `❚❚ 멈추기 (${playing + 1}/${clips.length})`}
        </button>
        {editable && (
          <button
            className="btn-ghost"
            onClick={async () => {
              if (confirm("이 모음을 지울까요? 녹음은 지워지지 않아요.")) {
                await api.del(`/spaces/${spaceId}/collections/${id}`).catch(() => {});
                onDeleted();
              }
            }}
          >
            모음 지우기
          </button>
        )}
      </div>
      {clips.map((c, i) => (
        <div key={c.clip_id} className={playing === i ? "rounded-3xl ring-2 ring-accent" : ""}>
          <ClipCardView card={c} spaceId={spaceId} personName={personName} canFavorite />
        </div>
      ))}
    </div>
  );
}

export default function CollectionsPage() {
  const { space } = useSpace();
  const list = useApi<CollectionList>(`/spaces/${space.id}/collections`);
  const [open, setOpen] = useState<string | null>(null);
  if (!list.data) return <Spinner />;
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl font-bold">클립 모음</h2>
      {list.data.collections.length === 0 && (
        <Empty title="아직 모음이 없어요">
          <Link href={`/spaces/${space.id}/timeline`} className="underline underline-offset-4">타임라인</Link>에서 ★ 즐겨찾기를 모은 뒤 ‘즐겨찾기로 모음 만들기’를 눌러 보세요.
        </Empty>
      )}
      <ul className="space-y-3">
        {list.data.collections.map((c) => (
          <li key={c.id} className="card">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
              <span className="font-semibold">{c.title}</span>
              <span className="text-sm text-ink-soft">클립 {c.clip_ids.length}개</span>
            </button>
            {open === c.id && (
              <div className="mt-4">
                <CollectionView id={c.id} spaceId={space.id} personName={space.person_name} editable={space.role !== "viewer"} onDeleted={() => { setOpen(null); void list.reload(); }} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
