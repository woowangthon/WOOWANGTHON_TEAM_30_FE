"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/hooks";
import type { Space, Timeline, TimelineItem } from "@/lib/api-types.gen";
import { ClipCardView } from "./ClipCardView";
import { Empty, ErrorBox, Spinner } from "./Feedback";

function Items({ items, space, canFavorite }: { items: TimelineItem[]; space: Space; canFavorite: boolean }) {
  const photos = items.filter((i) => i.kind === "photo" && i.photo).map((i) => i.photo!);
  const clips = items.filter((i) => i.kind === "clip" && i.clip).map((i) => i.clip!);
  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <a key={p.asset_id} href={p.url} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || "사진"} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              {p.caption && <span className="mt-1 block truncate text-xs text-ink-soft">{p.caption}</span>}
            </a>
          ))}
        </div>
      )}
      {clips.map((c) => (
        <ClipCardView key={c.clip_id} card={c} spaceId={space.id} personName={space.person_name} canFavorite={canFavorite} />
      ))}
    </div>
  );
}

export function TimelineView({ space, canFavorite }: { space: Space; canFavorite: boolean }) {
  const [tag, setTag] = useState<string | null>(null);
  const [favorites, setFavorites] = useState(false);
  const qs = new URLSearchParams();
  if (tag) qs.set("tag", tag);
  if (favorites) qs.set("favorites", "true");
  const tl = useApi<Timeline>(`/spaces/${space.id}/timeline${qs.toString() ? `?${qs}` : ""}`);
  const [allTags, setAllTags] = useState<[string, number][]>([]);
  // 주제 칩은 필터를 걸지 않은 첫 응답의 태그 개수로 만든다
  useEffect(() => {
    if (tl.data && !tag && !favorites) setAllTags(Object.entries(tl.data.tag_counts).slice(0, 14));
  }, [tl.data, tag, favorites]);

  return (
    <div className="space-y-6">
      {space.counts.processing > 0 && (
        <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink-soft">
          정리 중인 자료가 {space.counts.processing}개 있어요. 끝나면 여기에 나타나요.{" "}
          <button className="underline underline-offset-4" onClick={() => void tl.reload()}>새로 고침</button>
        </p>
      )}
      {tl.data && tl.data.on_this_day.length > 0 && !tag && !favorites && (
        <section className="rounded-3xl border border-accent/30 bg-accent-soft p-4" aria-labelledby="otd">
          <h2 id="otd" className="mb-3 font-serif text-lg font-bold text-accent-strong">
            지난해 오늘
          </h2>
          <Items items={tl.data.on_this_day} space={space} canFavorite={canFavorite} />
        </section>
      )}
      <div className="-mx-4 overflow-x-auto px-4" role="toolbar" aria-label="주제로 보기">
        <div className="flex gap-2 whitespace-nowrap">
          <button className={`chip min-h-10 ${!tag && !favorites ? "border-ink bg-ink text-paper" : ""}`} onClick={() => { setTag(null); setFavorites(false); }}>
            전체
          </button>
          {canFavorite && (
            <button className={`chip min-h-10 ${favorites ? "border-ink bg-ink text-paper" : ""}`} onClick={() => { setFavorites(!favorites); setTag(null); }} aria-pressed={favorites}>
              ★ 즐겨찾기
            </button>
          )}
          {allTags.map(([t, n]) => (
            <button key={t} className={`chip min-h-10 ${tag === t ? "border-ink bg-ink text-paper" : ""}`} onClick={() => { setTag(tag === t ? null : t); setFavorites(false); }} aria-pressed={tag === t}>
              {t} <span className="ml-1 text-xs opacity-70">{n}</span>
            </button>
          ))}
        </div>
      </div>
      {tl.error && <ErrorBox message={tl.error.messageKo} onRetry={tl.reload} />}
      {tl.loading && !tl.data && <Spinner />}
      {tl.data && tl.data.total === 0 && (
        <Empty title={favorites ? "즐겨찾기한 녹음이 아직 없어요" : "아직 보여 드릴 추억이 없어요"}>
          {favorites ? "대화나 타임라인에서 ☆를 눌러 모아 보세요." : "자료를 올리고 목소리를 확인하면 여기에 날짜별로 모여요."}
        </Empty>
      )}
      {tl.data?.days.map((d) => (
        <section key={d.date || "unknown"} aria-label={d.label}>
          <h3 className="sticky top-14 z-10 -mx-4 bg-paper/95 px-4 py-2 font-semibold text-ink-soft backdrop-blur">{d.label}</h3>
          <Items items={d.items} space={space} canFavorite={canFavorite} />
        </section>
      ))}
    </div>
  );
}
