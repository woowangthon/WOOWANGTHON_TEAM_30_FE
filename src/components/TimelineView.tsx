"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { useSpace } from "@/lib/space-context";
import type { ClipCard, PhotoRef, Space, Timeline, TimelineItem } from "@/lib/api-types.gen";
import { ClipCardView } from "./ClipCardView";
import { Slideshow } from "./Slideshow";
import { api, errorMessage } from "@/lib/api";
import type { Collection } from "@/lib/api-types.gen";
import { Empty, ErrorBox, Spinner } from "./Feedback";
import { Icon } from "./Icons";

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

/** '1년 전 오늘', '3년 전 오늘', 여러 해가 섞이면 '예전 오늘' */
function onThisDayTitle(items: TimelineItem[]): string {
  const years = new Set(items.map((i) => (i.clip?.date || i.photo?.date || "").slice(0, 4)).filter(Boolean));
  if (years.size !== 1) return "예전 오늘";
  const diff = new Date().getFullYear() - Number([...years][0]);
  return diff > 0 ? `${diff}년 전 오늘` : "예전 오늘";
}

function matches(i: TimelineItem, q: string): boolean {
  const t = (i.clip?.transcript || i.photo?.caption || "").toLowerCase();
  return t.includes(q.toLowerCase());
}

export function TimelineView({ space, canFavorite }: { space: Space; canFavorite: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const { base } = useSpace();
  const paramTag = params.get("tag");
  const query = params.get("q")?.trim() || "";
  const [tag, setTag] = useState<string | null>(paramTag);
  const [favorites, setFavorites] = useState(false);
  // 홈의 주제 카드나 위쪽 검색에서 넘어오면 그 주제로 맞춘다
  useEffect(() => {
    setTag(paramTag);
  }, [paramTag]);
  const qs = new URLSearchParams();
  if (tag) qs.set("tag", tag);
  if (favorites) qs.set("favorites", "true");
  const tl = useApi<Timeline>(`/spaces/${space.id}/timeline${qs.toString() ? `?${qs}` : ""}`);
  const [allTags, setAllTags] = useState<[string, number][]>([]);
  const [show, setShow] = useState<{ photos: PhotoRef[]; clips: ClipCard[] } | null>(null);
  const [note, setNote] = useState("");
  const days = useMemo(() => {
    if (!tl.data) return undefined;
    if (!query) return tl.data.days;
    return tl.data.days.map((d) => ({ ...d, items: d.items.filter((i) => matches(i, query)) })).filter((d) => d.items.length > 0);
  }, [tl.data, query]);
  const found = days?.reduce((n, d) => n + d.items.length, 0) ?? 0;
  // 주제 칩은 필터를 걸지 않은 응답의 태그 개수로 만든다.
  // 주제를 고른 채로 들어왔으면(홈의 주제 카드) 필터 없는 목록을 한 번 따로 받는다.
  const unfiltered = useApi<Timeline>(allTags.length === 0 && (tag || favorites) ? `/spaces/${space.id}/timeline` : null);
  useEffect(() => {
    const src = !tag && !favorites ? tl.data : unfiltered.data;
    if (src) setAllTags(Object.entries(src.tag_counts).slice(0, 14));
  }, [tl.data, unfiltered.data, tag, favorites]);

  return (
    <div className="space-y-6">
      {space.counts.processing > 0 && (
        <p className="rounded-2xl bg-paper px-4 py-3 text-sm text-ink-soft">
          정리 중인 자료가 {space.counts.processing}개 있어요. 끝나면 여기에 나타나요.{" "}
          <button className="underline underline-offset-4" onClick={() => void tl.reload()}>새로 고침</button>
        </p>
      )}
      {query && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3 text-[0.95rem]" role="status">
          <span>
            <b className="font-semibold text-accent-strong">‘{query}’</b> 검색 결과 {tl.data ? `${found}개` : "찾는 중"}
          </span>
          <button className="ml-auto text-sm text-ink-soft underline underline-offset-4" onClick={() => router.replace(`${base}/timeline`)}>
            검색 지우기
          </button>
        </div>
      )}
      {tl.data && tl.data.on_this_day.length > 0 && !tag && !favorites && !query && (
        <section className="rounded-[1.4rem] border border-peach/40 bg-peach-soft/60 p-5" aria-labelledby="otd">
          <h2 id="otd" className="mb-3 font-serif text-lg font-bold text-accent-strong">
            {onThisDayTitle(tl.data.on_this_day)}
          </h2>
          <Items items={tl.data.on_this_day} space={space} canFavorite={canFavorite} />
        </section>
      )}
      <div className="-mx-4 overflow-x-auto px-4" role="toolbar" aria-label="주제로 보기">
        <div className="flex gap-2 whitespace-nowrap">
          <button className={`chip min-h-10 ${!tag && !favorites ? "chip-on" : ""}`} onClick={() => { setTag(null); setFavorites(false); }}>
            전체
          </button>
          {canFavorite && !space.is_sample && (
            <Link href={`/spaces/${space.id}/collections`} className="chip min-h-10">
              모음
            </Link>
          )}
          {canFavorite && (
            <button className={`chip min-h-10 ${favorites ? "chip-on" : ""}`} onClick={() => { setFavorites(!favorites); setTag(null); }} aria-pressed={favorites}>
              ★ 즐겨찾기
            </button>
          )}
          {allTags.map(([t, n]) => (
            <button key={t} className={`chip min-h-10 ${tag === t ? "chip-on" : ""}`} onClick={() => { setTag(tag === t ? null : t); setFavorites(false); }} aria-pressed={tag === t}>
              {t} <span className="ml-1 text-xs opacity-70">{n}</span>
            </button>
          ))}
        </div>
      </div>
      {tl.error && <ErrorBox message={tl.error.messageKo} onRetry={tl.reload} />}
      {tl.loading && !tl.data && <Spinner />}
      {tl.data && query && found === 0 && tl.data.total > 0 && (
        <Empty title="그 말이 들어간 녹음을 찾지 못했어요">다른 낱말로 찾아보거나, 기억 대화에서 물어보세요.</Empty>
      )}
      {tl.data && tl.data.total === 0 && (
        <Empty title={favorites ? "즐겨찾기한 녹음이 아직 없어요" : "아직 보여 드릴 추억이 없어요"}>
          {favorites ? "대화나 타임라인에서 ☆를 눌러 모아 보세요." : "자료를 올리고 목소리를 확인하면 여기에 날짜별로 모여요."}
        </Empty>
      )}
      {favorites && canFavorite && tl.data && tl.data.total > 0 && space.role !== "viewer" && !space.is_sample && (
        <button
          className="btn-soft w-full"
          onClick={async () => {
            const title = prompt("모음 이름을 지어 주세요", `${space.person_name}의 목소리 모음`);
            if (!title) return;
            const ids = tl.data!.days.flatMap((d) => d.items.filter((i) => i.clip).map((i) => i.clip!.clip_id));
            try {
              await api.post<Collection>(`/spaces/${space.id}/collections`, { title, clip_ids: ids });
              setNote("모음을 만들었어요. 위의 ‘모음’에서 이어서 들을 수 있어요.");
            } catch (e) {
              setNote(errorMessage(e));
            }
          }}
        >
          즐겨찾기로 모음 만들기
        </button>
      )}
      {note && <p className="text-sm text-sage" role="status">{note}</p>}
      {days?.map((d) => {
        const photos = d.items.filter((i) => i.photo).map((i) => i.photo!);
        const clips = d.items.filter((i) => i.clip).map((i) => i.clip!);
        return (
          <section key={d.date || "unknown"} aria-label={d.label}>
            <h3 className="sticky top-[7.4rem] z-10 -mx-4 mb-1 flex items-center gap-2 bg-paper/90 px-4 py-2.5 font-serif text-[1.05rem] font-bold text-ink backdrop-blur lg:top-[5.5rem]">
              <Icon name="calendar" size={17} className="text-accent" />
              {d.label}
              {photos.length > 0 && clips.length > 0 && (
                <button className="ml-auto rounded-full bg-accent-soft px-3 py-1 text-sm text-accent-strong" onClick={() => setShow({ photos, clips })}>
                  ▶ 사진과 함께 듣기
                </button>
              )}
            </h3>
            <Items items={d.items} space={space} canFavorite={canFavorite} />
          </section>
        );
      })}
      {show && <Slideshow photos={show.photos} clips={show.clips} personName={space.person_name} onClose={() => setShow(null)} />}
    </div>
  );
}
