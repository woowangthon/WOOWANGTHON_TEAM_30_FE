"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ClipCard, Space, Timeline } from "@/lib/api-types.gen";
import { useApi } from "@/lib/hooks";
import { canEdit } from "@/lib/space-context";
import { AskBox } from "./AskBox";
import { Empty, ErrorBox, Notice, Spinner } from "./Feedback";
import { Icon } from "./Icons";
import { VoiceRow, dotDate } from "./VoiceRow";

/** 주제 카드 그림. 주제 태그가 가까운 그림을 먼저 고르고, 같은 그림이 겹치지 않게 나눈다. */
const CHAPTER_ART: { src: string; tags: string[] }[] = [
  { src: "/images/chapter-kitchen.webp", tags: ["음식", "요리", "살림", "집", "시장", "밭", "건강", "병원"] },
  { src: "/images/chapter-table.webp", tags: ["손주", "사랑", "명절", "생일", "감사", "칭찬", "응원", "위로", "아들", "딸", "배우자", "부모님", "형제자매", "걱정", "잔소리", "웃음", "안부", "공부", "학교", "일", "직장", "돈"] },
  { src: "/images/chapter-walk.webp", tags: ["계절", "날씨", "여행", "바다", "산", "고향", "어린시절", "젊은시절", "그리움", "이웃", "친구", "결혼", "노래", "조언"] },
];

const CHAPTER_DESC: Record<string, string> = {
  음식: "손맛이 담긴 음식 이야기", 요리: "부엌에서 들려준 요리 이야기", 살림: "집안 살림과 하루하루", 시장: "시장 다녀온 이야기",
  손주: "손주를 부르던 다정한 목소리", 사랑: "아끼고 사랑한다는 말들", 명절: "온 가족이 모이던 명절", 생일: "생일을 축하하던 목소리",
  감사: "고맙다고 건네던 말", 칭찬: "잘했다고 다독이던 말", 응원: "힘내라고 건네던 응원", 위로: "힘들 때 토닥이던 말",
  걱정: "늘 마음 쓰던 걱정의 말", 잔소리: "지금은 그리운 잔소리", 웃음: "함께 웃던 순간들", 안부: "안부를 묻던 전화",
  공부: "공부하던 날의 응원", 학교: "학교 다니던 날들", 건강: "건강을 챙기던 당부", 계절: "계절이 바뀌던 날의 이야기",
  날씨: "날씨를 묻던 안부", 여행: "함께 다녀온 길 이야기", 고향: "고향과 옛 동네 이야기", 어린시절: "어린 시절 이야기",
  젊은시절: "젊었을 적 이야기", 그리움: "보고 싶다던 마음", 조언: "살아가며 건넨 조언", 집: "집에서의 일상",
};

interface Chapter {
  tag: string;
  title: string;
  desc: string;
  count: number;
  latest: string | null;
  art: string;
}

function buildChapters(tl: Timeline, clips: ClipCard[]): Chapter[] {
  const top = Object.entries(tl.tag_counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const used = new Set<string>();
  return top.map(([tag, count]) => {
    const preferred = CHAPTER_ART.find((a) => a.tags.includes(tag) && !used.has(a.src));
    const art = (preferred || CHAPTER_ART.find((a) => !used.has(a.src)) || CHAPTER_ART[0]).src;
    used.add(art);
    const latest = clips.find((c) => c.tags.includes(tag as ClipCard["tags"][number]) && c.date)?.date ?? null;
    return { tag, count, latest, art, title: tag, desc: CHAPTER_DESC[tag] || `${tag}에 얽힌 이야기들` };
  });
}

function Hero({ space, base }: { space: Space; base: string }) {
  const c = space.counts;
  const who = [space.person_name, space.relationship].filter(Boolean).join(" ");
  return (
    <section className="relative isolate overflow-hidden rounded-[1.6rem] border border-line bg-[#f6efe4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/hero-kitchen.webp" alt="" className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover sm:w-[66%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f6efe4] from-25% via-[#f6efe4]/85 via-50% to-[#f6efe4]/0 sm:from-35% sm:via-[#f6efe4]/70" />
      <div className="max-w-[26rem] px-6 py-8 sm:px-9 sm:py-10">
        <p className="text-sm text-ink-soft">{space.is_sample ? "샘플 공간 · 가상 인물" : space.role === "owner" ? "내 추억 공간" : "초대받은 추억 공간"}</p>
        <h2 className="mt-1.5 font-serif text-[1.85rem] font-bold leading-tight text-ink sm:text-[2.15rem]">{who}</h2>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">
          {space.relationship || "그분"}의 실제 목소리로 남긴
          <br />
          우리 가족의 일상과 이야기
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={`${base}/timeline`} className="btn-primary rounded-xl bg-accent-strong px-6 text-[1.02rem] hover:bg-accent">
            <Icon name="mic" size={19} />
            녹음 모아 듣기
            <Icon name="arrow-right" size={18} />
          </Link>
          <Link href={`${base}/chat`} className="btn rounded-xl border border-accent/25 bg-card/80 px-5 text-accent-strong hover:bg-card">
            <Icon name="chat" size={19} />
            말 걸기
          </Link>
        </div>
        <p className="mt-5 text-sm text-ink-soft">
          목소리 <b className="font-semibold text-accent-strong">{c.person_clips}</b>개 <span className="mx-1 text-ink-faint">·</span> 사진 {c.photos}장{" "}
          <span className="mx-1 text-ink-faint">·</span> 자료 {c.assets}개
        </p>
      </div>
    </section>
  );
}

function ChapterCard({ ch, index, base }: { ch: Chapter; index: number; base: string }) {
  return (
    <Link
      href={`${base}/timeline?tag=${encodeURIComponent(ch.tag)}`}
      className="group overflow-hidden rounded-[1.1rem] border border-line bg-card transition-transform hover:-translate-y-0.5 hover:border-accent/30"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ch.art} alt="" loading="lazy" className="h-28 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="px-5 pb-4 pt-4">
        <p className="flex items-baseline gap-2 text-[1.08rem]">
          <span className="text-sm text-accent">주제 {index + 1}</span>
          <span className="font-serif font-bold">{ch.title}</span>
        </p>
        <p className="mt-1 truncate text-sm text-ink-soft">{ch.desc}</p>
        <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" size={16} />
            {dotDate(ch.latest)}
          </span>
          <span aria-hidden className="h-3.5 w-px bg-line" />
          <span className="inline-flex items-center gap-1.5">
            <Icon name="mic" size={16} />
            녹음 {ch.count}개
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionTitle({ icon, title, sub, action }: { icon: Parameters<typeof Icon>[0]["name"]; title: string; sub: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 font-serif text-[1.5rem] font-bold">
          <Icon name={icon} size={24} className="text-ink-soft" />
          {title}
        </h2>
        <p className="mt-0.5 pl-[2.1rem] text-sm text-ink-soft">{sub}</p>
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

export function SpaceHome({ space, base }: { space: Space; base: string }) {
  const c = space.counts;
  const editable = canEdit(space);
  const tl = useApi<Timeline>(c.person_clips > 0 ? `/spaces/${space.id}/timeline` : null);

  const clips = useMemo(() => (tl.data ? tl.data.days.flatMap((d) => d.items.filter((i) => i.clip).map((i) => i.clip!)) : []), [tl.data]);
  const chapters = useMemo(() => (tl.data ? buildChapters(tl.data, clips) : []), [tl.data, clips]);
  const recent = clips.slice(0, 3);

  const steps = [
    { done: c.assets > 0, title: "자료 올리기", body: "통화 녹음, 영상, 음성 메시지, 사진을 올려요.", href: `${base}/upload`, icon: "upload" as const },
    { done: c.pending_voice === 0 && c.person_clips > 0, title: "목소리 확인", body: "어느 목소리가 그분인지 골라요.", href: `${base}/voices`, icon: "users" as const },
    { done: false, title: "말 걸기", body: "메시지를 보내면 그분 말투로 답장이 와요.", href: `${base}/chat`, icon: "chat" as const },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-7 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-7">
        <Hero space={space} base={base} />
        <AskBox base={base} personName={space.person_name} />

        {c.pending_voice > 0 && editable && (
          <Link href={`${base}/voices`} className="flex items-center gap-3 rounded-2xl border border-peach/40 bg-peach-soft px-5 py-3.5 text-[0.98rem] text-ink hover:border-peach">
            <span className="grid h-7 min-w-7 place-items-center rounded-full bg-peach px-2 text-sm font-semibold text-white">{c.pending_voice}</span>
            목소리 확인이 필요한 자료가 있어요. 확인해야 대화에 쓰여요.
            <Icon name="arrow-right" size={18} className="ml-auto text-ink-soft" />
          </Link>
        )}

        <section>
          {c.person_clips === 0 ? (
            <>
              <SectionTitle icon="chapters" title="시작하기" sub="세 단계면 그분의 목소리로 공간이 채워져요." />
              {editable ? (
                <ol className="grid gap-4 md:grid-cols-3">
                  {steps.map((s, i) => (
                    <li key={s.title}>
                      <Link href={s.href} className="card flex h-full flex-col gap-3 hover:border-accent/40">
                        <span className="font-serif text-lg font-bold">
                          <span className="mr-2 text-accent">{s.done ? "✓" : `${i + 1}.`}</span>
                          {s.title}
                        </span>
                        <span className="text-[0.95rem] text-ink-soft">{s.body}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty title="아직 모아 둔 목소리가 없어요">자료가 정리되면 여기에 주제별로 모여요.</Empty>
              )}
            </>
          ) : (
            <>
              <SectionTitle
                icon="chapters"
                title="주제별로 듣기"
                sub="녹음에 자주 나온 이야기를 주제별로 모았어요."
                action={
                  <Link href={`${base}/timeline`} className="inline-flex items-center gap-1 font-semibold text-accent-strong hover:underline">
                    전체 보기 <Icon name="arrow-right" size={17} />
                  </Link>
                }
              />
              {tl.error && <ErrorBox message={tl.error.messageKo} onRetry={tl.reload} />}
              {!tl.data && !tl.error && <Spinner />}
              {tl.data && chapters.length === 0 && <Empty title="아직 주제로 묶인 이야기가 없어요">녹음이 정리되면 주제별로 모여요.</Empty>}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((ch, i) => (
                  <ChapterCard key={ch.tag} ch={ch} index={i} base={base} />
                ))}
              </div>
            </>
          )}
        </section>

        {space.is_sample && (
          <Notice tone="sage">
            가상 인물로 만든 샘플 공간이에요. 실제 녹음은 아직 준비 중이라 자막과 &lsquo;샘플 녹음 준비 중&rsquo; 표시로 보여 드려요.
          </Notice>
        )}
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <section className="card p-6" aria-labelledby="recent-voices">
          <h2 id="recent-voices" className="flex items-center gap-2.5 font-serif text-[1.45rem] font-bold">
            <Icon name="mic" size={24} />
            최근 목소리
          </h2>
          <p className="mt-1 text-sm text-ink-soft">가장 최근 날짜의 실제 녹음이에요.</p>
          <div className="mt-3 divide-y divide-line border-t border-line">
            {c.person_clips === 0 && <p className="py-6 text-[0.95rem] text-ink-soft">목소리를 확인한 녹음이 생기면 여기에 보여요.</p>}
            {c.person_clips > 0 && !tl.data && !tl.error && <Spinner />}
            {recent.map((clip) => (
              <VoiceRow key={clip.clip_id} clip={clip} personName={space.person_name} />
            ))}
          </div>
          {recent.some((r) => r.audio_status === "placeholder") && (
            <p className="-mt-1 pb-2 text-xs text-ink-faint">샘플 녹음은 준비 중이라 지금은 자막으로 보여 드려요.</p>
          )}
          {recent.length > 0 && (
            <Link href={`${base}/timeline`} className="mt-1 flex items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-accent-strong hover:bg-accent-soft/60">
              날짜별로 모두 듣기 <Icon name="arrow-right" size={16} />
            </Link>
          )}
          <p className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-paper-deep px-4 py-3.5 text-sm text-ink-soft">
            <Icon name="lock" size={17} />
            {space.is_sample ? "샘플 공간은 가상 인물로 만든 체험용이에요." : "초대한 가족만 볼 수 있어요."}
          </p>
        </section>
        {c.processing > 0 && (
          <p className="mt-4 rounded-2xl border border-line bg-card/70 px-4 py-3 text-sm text-ink-soft">정리 중인 자료가 {c.processing}개 있어요. 끝나면 타임라인에 더해져요.</p>
        )}
      </aside>
    </div>
  );
}
