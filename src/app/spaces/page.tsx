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
    <Shell right={me.data && <UserMenu user={me.data} />}>
      <PageTitle title="추억 공간" sub="한 사람마다 공간을 하나씩 만들어요. 공간은 나와 초대한 가족만 볼 수 있어요." />
      {me.data && <Notices />}
      {spaces.loading && <Spinner />}
      {spaces.error && <ErrorBox message={spaces.error.messageKo} onRetry={spaces.reload} />}
      <ul className="space-y-3">
        {spaces.data?.map((s) => (
          <li key={s.id}>
            <Link href={`/spaces/${s.id}`} className="card flex items-center gap-4 hover:border-accent/40">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-lg text-accent-strong" aria-hidden>
                {s.person_name.slice(0, 1)}
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold">{s.name}</span>
                <span className="block text-sm text-ink-soft">
                  목소리 클립 {s.counts.person_clips}개 · 자료 {s.counts.assets}개{s.role !== "owner" ? " · 초대받은 공간" : ""}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {spaces.data && spaces.data.length === 0 && !open && (
        <div className="card text-center">
          <p className="text-lg font-semibold">아직 만든 공간이 없어요</p>
          <p className="mt-1 text-ink-soft">그리운 사람, 또는 목소리를 미리 남겨 두고 싶은 사람의 공간을 만들어 보세요.</p>
        </div>
      )}
      {!open ? (
        <button className="btn-primary mt-6 w-full" onClick={() => setOpen(true)}>
          + 새 추억 공간 만들기
        </button>
      ) : (
        <form onSubmit={create} className="card mt-6 space-y-4">
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
                  className={`chip min-h-10 ${form.relationship === r ? "border-accent bg-accent-soft text-accent-strong" : ""}`}
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
