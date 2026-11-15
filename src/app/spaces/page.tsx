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
import { Icon } from "@/components/Icons";

const RELATIONS = ["어머니", "아버지", "할머니", "할아버지", "배우자", "형제자매", "자녀", "친구"];

export default function SpacesPage() {
  const router = useRouter();
  const me = useMe(true);
  const spaces = useApi<Space[]>(me.data ? "/spaces" : null);
  const [open, setOpen] = useState(false);
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
    <Shell wide right={me.data && <UserMenu user={me.data} />}>
      <PageTitle title="추억 공간" sub="한 사람마다 공간을 하나씩 만들어요. 공간은 나와 초대한 가족만 볼 수 있어요." />
      {me.data && <Notices />}
      {spaces.loading && <Spinner />}
      {spaces.error && <ErrorBox message={spaces.error.messageKo} onRetry={spaces.reload} />}
      <ul className="grid gap-5 sm:grid-cols-2">
        {spaces.data?.map((s) => (
          <li key={s.id}>
            <Link
              href={`/spaces/${s.id}`}
              className="group block overflow-hidden rounded-[1.4rem] border border-line bg-card transition-transform hover:-translate-y-0.5 hover:border-accent/30"
            >
              <div className="relative h-28 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/hero-kitchen.webp" alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
              </div>
              <div className="-mt-9 flex items-end gap-4 px-5 pb-5">
                <span
                  aria-hidden
                  className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-card bg-accent-soft font-serif text-2xl font-bold text-accent-strong shadow-sm"
                >
                  {s.person_name.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1 pb-1">
                  <span className="block truncate font-serif text-xl font-bold">{s.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-soft">
                    <span className="inline-flex items-center gap-1"><Icon name="mic" size={15} /> 목소리 {s.counts.person_clips}개</span>
                    <span>자료 {s.counts.assets}개</span>
                    {s.role !== "owner" && <span className="rounded-full bg-accent-soft px-2 text-xs text-accent-strong">초대받은 공간</span>}
                  </span>
                </span>
                <Icon name="arrow-right" size={20} className="mb-2 text-ink-faint transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {spaces.data && spaces.data.length === 0 && !open && (
        <div className="card flex flex-col items-center gap-4 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/empty-letters.webp" alt="" className="h-36 w-full max-w-md rounded-2xl object-cover" />
          <p className="font-serif text-xl font-bold">아직 만든 공간이 없어요</p>
          <p className="text-ink-soft">그리운 사람, 또는 목소리를 미리 남겨 두고 싶은 사람의 공간을 만들어 보세요.</p>
        </div>
      )}
      {!open ? (
        <button
          className="mt-6 flex min-h-16 w-full items-center justify-center gap-2 rounded-[1.4rem] border-2 border-dashed border-accent/35 bg-card/60 font-semibold text-accent-strong transition-colors hover:border-accent hover:bg-accent-soft/50"
          onClick={() => setOpen(true)}
        >
          + 새 추억 공간 만들기
        </button>
      ) : (
        <form onSubmit={create} className="card mt-6 space-y-4 p-6 sm:p-7">
          <h2 className="section-title">새 추억 공간</h2>
          <div>
            <label className="label" htmlFor="name">공간 이름</label>
            <input id="name" className="field" required maxLength={40} placeholder="예: 엄마" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="person">그분을 부르는 말 또는 이름</label>
            <input id="person" className="field" maxLength={40} placeholder="예: 엄마, 김순자" value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="bday">생일 (선택)</label>
              <input id="bday" type="date" className="field" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="mday">기일 (선택)</label>
              <input id="mday" type="date" className="field" value={form.memorial_day} onChange={(e) => setForm({ ...form, memorial_day: e.target.value })} />
            </div>
          </div>
          {error && <ErrorBox message={error} />}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setOpen(false)}>취소</button>
            <button className="btn-primary flex-1" disabled={busy}>{busy ? "만드는 중…" : "만들기"}</button>
          </div>
        </form>
      )}
    </Shell>
  );
}
