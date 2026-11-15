"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi, useMe } from "@/lib/hooks";
import type { Space } from "@/lib/api-types.gen";
import { Shell, PageTitle } from "@/components/Shell";
import { ErrorBox, Spinner } from "@/components/Feedback";
import { UserMenu } from "@/components/UserMenu";
import { Notices } from "@/components/Notices";
import { Icon, type IconName } from "@/components/Icons";

const RELATIONS = ["어머니", "아버지", "할머니", "할아버지", "배우자", "형제자매", "자녀", "친구"];

// 자주 부르는 말을 누르면 공간 이름과 관계를 함께 채운다
const QUICK: { call: string; relation: string }[] = [
  { call: "엄마", relation: "어머니" },
  { call: "아빠", relation: "아버지" },
  { call: "할머니", relation: "할머니" },
  { call: "할아버지", relation: "할아버지" },
];

const NEXT_STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "upload", title: "녹음 올리기", body: "휴대폰의 통화 녹음, 영상, 카카오톡 음성 메시지를 올려요. 여러 개를 한 번에 올려도 돼요." },
  { icon: "users", title: "목소리 확인", body: "녹음마다 나뉜 목소리를 들어 보고 ‘이 목소리가 그분이에요’만 골라 주세요." },
  { icon: "chat", title: "말 걸기", body: "메시지를 보내면 그분 말투로 답장이 와요. 녹음에 있는 말은 실제 목소리로 들려 드려요." },
];

function SpaceForm({ first, onCancel }: { first?: boolean; onCancel?: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", person_name: "", relationship: "", birthday: "", memorial_day: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const s = await api.post<Space>("/spaces", {
        name: form.name,
        person_name: form.person_name || form.name,
        relationship: form.relationship || null,
        birthday: form.birthday || null,
        memorial_day: form.memorial_day || null,
      });
      router.push(`/spaces/${s.id}/upload`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="card space-y-5 p-6 sm:p-7">
      <div>
        <p className="text-sm font-semibold text-accent">{first ? "첫 공간 만들기" : "새 추억 공간"}</p>
        <h2 className="mt-1 font-serif text-[1.45rem] font-bold leading-snug">누구의 목소리를 모을까요?</h2>
      </div>

      <div>
        <span className="label">자주 부르는 말</span>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => {
            const on = form.name === q.call;
            return (
              <button
                type="button"
                key={q.call}
                aria-pressed={on}
                className={`chip min-h-11 px-4 text-[0.95rem] ${on ? "chip-on" : ""}`}
                onClick={() => setForm({ ...form, name: q.call, relationship: q.relation })}
              >
                {q.call}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="name">공간 이름</label>
        <input id="name" className="field" required maxLength={40} placeholder="예: 엄마, 우리 할매" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>

      <div>
        <label className="label" htmlFor="person">그분을 부르는 말 또는 이름 <span className="font-normal text-ink-faint">(공간 이름과 같으면 비워 두세요)</span></label>
        <input id="person" className="field" maxLength={40} placeholder="예: 김순자" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
      </div>

      <div>
        <span className="label">관계</span>
        <div className="flex flex-wrap gap-2">
          {RELATIONS.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, relationship: form.relationship === r ? "" : r })}
              className={`chip min-h-10 ${form.relationship === r ? "chip-on" : ""}`}
              aria-pressed={form.relationship === r}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <details className="group rounded-xl border border-line px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.95rem] text-ink-soft [&::-webkit-details-marker]:hidden">
          생일·기일 넣기 <span className="text-ink-faint">(선택, ‘예전 오늘’ 추억에 쓰여요)</span>
          <Icon name="chevron-down" size={17} className="ml-auto transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="bday">생일</label>
            <input id="bday" type="date" className="field" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="mday">기일</label>
            <input id="mday" type="date" className="field" value={form.memorial_day} onChange={(e) => setForm({ ...form, memorial_day: e.target.value })} />
          </div>
        </div>
      </details>

      {error && <ErrorBox message={error} />}
      <div className="flex flex-col gap-2 sm:flex-row">
        {onCancel && <button type="button" className="btn-ghost sm:flex-1" onClick={onCancel}>취소</button>}
        <button className="btn-primary text-[1.05rem] sm:flex-[2]" disabled={busy || !form.name.trim()}>
          {busy ? "만드는 중…" : "만들고 녹음 올리러 가기"}
          {!busy && <Icon name="arrow-right" size={18} />}
        </button>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-ink-faint">
        <Icon name="lock" size={15} /> 공간은 나와 내가 초대한 가족만 볼 수 있어요.
      </p>
    </form>
  );
}

function WhatNext() {
  return (
    <aside className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-line bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/empty-letters.webp" alt="" className="h-36 w-full object-cover" />
        <div className="p-6">
          <h2 className="font-serif text-[1.2rem] font-bold">공간을 만들면 이렇게 이어져요</h2>
          <ol className="mt-4 space-y-4">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span aria-hidden className="mt-0.5 font-serif text-lg font-bold text-accent">{i + 1}</span>
                <div>
                  <p className="flex items-center gap-1.5 font-semibold">
                    <Icon name={s.icon} size={17} className="text-ink-soft" />
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[0.95rem] text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Link href="/sample" className="flex items-center gap-3 rounded-xl border border-line bg-card px-5 py-4 hover:border-accent/40">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">먼저 둘러볼래요</span>
          <span className="block text-sm text-ink-soft">가상 인물 ‘김순자 할머니’ 샘플 공간에서 말을 걸어 보세요.</span>
        </span>
        <Icon name="arrow-right" size={18} className="text-ink-faint" />
      </Link>
      <p className="rounded-xl bg-paper-deep px-5 py-4 text-[0.95rem] text-ink-soft">
        부모님이 곁에 계신다면, 공간을 만든 뒤 <b className="font-semibold text-ink">미리 남기기</b>로 질문 카드 링크를 보내 지금 목소리를 받아 둘 수 있어요.
      </p>
    </aside>
  );
}

export default function SpacesPage() {
  const me = useMe(true);
  const spaces = useApi<Space[]>(me.data ? "/spaces" : null);
  const [open, setOpen] = useState(false);
  const empty = spaces.data && spaces.data.length === 0;

  return (
    <Shell wide right={me.data && <UserMenu user={me.data} />}>
      {empty ? (
        <PageTitle title={`${me.data?.display_name ?? ""} 님, 반가워요`} sub="그리운 사람의 목소리를 모아 둘 첫 공간을 만들어 볼까요? 1분이면 돼요." />
      ) : (
        <PageTitle title="추억 공간" sub="한 사람마다 공간을 하나씩 만들어요. 공간은 나와 초대한 가족만 볼 수 있어요." />
      )}
      {me.data && <Notices />}
      {spaces.loading && !spaces.data && <Spinner />}
      {spaces.error && <ErrorBox message={spaces.error.messageKo} onRetry={spaces.reload} />}

      {empty && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <SpaceForm first />
          <WhatNext />
        </div>
      )}

      {spaces.data && spaces.data.length > 0 && (
        <>
          <ul className="grid gap-5 sm:grid-cols-2">
            {spaces.data.map((s) => (
              <li key={s.id}>
                <Link href={`/spaces/${s.id}`} className="group block overflow-hidden rounded-xl border border-line bg-card hover:border-accent/40">
                  <div className="relative h-28 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/hero-kitchen.webp" alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  </div>
                  <div className="-mt-9 flex items-end gap-4 px-5 pb-5">
                    <span aria-hidden className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-card bg-accent-soft font-serif text-2xl font-bold text-accent-strong">
                      {s.person_name.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1 pb-1">
                      <span className="block truncate font-serif text-xl font-bold">{s.name}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                        <span className="inline-flex items-center gap-1"><Icon name="mic" size={15} /> 목소리 {s.counts.person_clips}개</span>
                        <span>자료 {s.counts.assets}개</span>
                        {s.counts.pending_voice > 0 && <span className="text-peach">확인할 목소리 {s.counts.pending_voice}</span>}
                        {s.role !== "owner" && <span className="rounded-full bg-accent-soft px-2 text-xs text-accent-strong">초대받은 공간</span>}
                      </span>
                    </span>
                    <Icon name="arrow-right" size={20} className="mb-2 text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {open ? (
              <SpaceForm onCancel={() => setOpen(false)} />
            ) : (
              <button
                className="flex min-h-16 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-card/60 font-semibold text-accent-strong hover:border-accent/50"
                onClick={() => setOpen(true)}
              >
                + 새 추억 공간 만들기
              </button>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}
