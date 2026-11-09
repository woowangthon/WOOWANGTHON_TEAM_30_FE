"use client";

import { useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi, useMe } from "@/lib/hooks";
import type { QuestionDeck, RecordingLink, RecordingLinkList } from "@/lib/api-types.gen";
import { canEdit, useSpace } from "@/lib/space-context";
import { formatDateKo } from "@/lib/format";
import { ErrorBox, Notice, Spinner } from "@/components/Feedback";

const STATUS: Record<string, string> = { active: "녹음 기다리는 중", completed: "다 녹음했어요", expired: "기간 지남", revoked: "멈춤" };

function NewLink({ spaceId, onCreated }: { spaceId: string; onCreated: (l: RecordingLink) => void }) {
  const deck = useApi<QuestionDeck>("/questions");
  const me = useMe(true);
  const [cat, setCat] = useState<string>("childhood");
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [customs, setCustoms] = useState<string[]>([]);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const cards = useMemo(() => deck.data?.cards.filter((c) => c.category === cat) ?? [], [deck.data, cat]);
  const byId = useMemo(() => new Map(deck.data?.cards.map((c) => [c.id, c]) ?? []), [deck.data]);

  if (!deck.data) return <Spinner />;
  const total = picked.length + customs.length;

  async function create() {
    setBusy(true);
    setErr("");
    try {
      const link = await api.post<RecordingLink>(`/spaces/${spaceId}/links`, {
        question_ids: picked,
        custom_questions: customs,
        sender_name: sender || me.data?.display_name || null,
        message: message || null,
        expires_days: days,
      });
      onCreated(link);
      setPicked([]);
      setCustoms([]);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-5">
      <div>
        <h2 className="font-semibold">1. 질문 고르기 ({total}/20)</h2>
        <p className="text-sm text-ink-soft">부모님이 편하게 이야기할 수 있는 질문을 몇 개만 골라 보세요. 처음엔 3~5개가 좋아요.</p>
      </div>
      <div className="-mx-1 flex flex-wrap gap-2" role="tablist" aria-label="질문 묶음">
        {deck.data.categories.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} className={`chip min-h-10 ${cat === c.id ? "border-accent bg-accent-soft text-accent-strong" : ""}`} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {cards.map((c) => {
          const on = picked.includes(c.id);
          return (
            <li key={c.id}>
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${on ? "border-accent bg-accent-soft" : "border-line"}`}>
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 accent-[var(--color-accent)]"
                  checked={on}
                  disabled={!on && total >= 20}
                  onChange={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                />
                <span>{c.text}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div>
        <label className="label" htmlFor="custom-q">직접 쓰는 질문 (5개까지)</label>
        <div className="flex gap-2">
          <input id="custom-q" className="field" maxLength={120} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="예: 우리 집 김장 날 이야기 해 주세요" />
          <button
            type="button"
            className="btn-soft shrink-0"
            disabled={custom.trim().length < 2 || customs.length >= 5 || total >= 20}
            onClick={() => {
              setCustoms([...customs, custom.trim()]);
              setCustom("");
            }}
          >
            더하기
          </button>
        </div>
      </div>
      {total > 0 && (
        <div className="rounded-2xl bg-paper p-3">
          <p className="mb-2 text-sm font-semibold text-ink-soft">고른 질문</p>
          <ol className="list-decimal space-y-1 pl-5">
            {picked.map((id) => (
              <li key={id}>
                {byId.get(id)?.text}{" "}
                <button className="text-sm text-ink-faint" onClick={() => setPicked(picked.filter((x) => x !== id))} aria-label="빼기">✕</button>
              </li>
            ))}
            {customs.map((t, i) => (
              <li key={`${t}-${i}`}>
                {t} <button className="text-sm text-ink-faint" onClick={() => setCustoms(customs.filter((_, j) => j !== i))} aria-label="빼기">✕</button>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="space-y-3">
        <h2 className="font-semibold">2. 녹음하는 분께 보일 말</h2>
        <div>
          <label className="label" htmlFor="sender">보내는 사람</label>
          <input id="sender" className="field" maxLength={40} value={sender} onChange={(e) => setSender(e.target.value)} placeholder={me.data?.display_name || "예: 막내딸 지은"} />
        </div>
        <div>
          <label className="label" htmlFor="msg">한마디 (선택)</label>
          <textarea id="msg" className="field" rows={2} maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="엄마 목소리로 이야기 들려주세요. 천천히 하셔도 돼요." />
        </div>
        <div>
          <label className="label" htmlFor="days">링크를 쓸 수 있는 기간</label>
          <select id="days" className="field" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {[3, 7, 14, 30].map((d) => (
              <option key={d} value={d}>{d}일</option>
            ))}
          </select>
        </div>
      </div>
      {err && <ErrorBox message={err} />}
      <button className="btn-primary w-full" disabled={busy || total === 0} onClick={create}>
        {busy ? "만드는 중…" : "녹음 링크 만들기"}
      </button>
    </section>
  );
}

function NewLinkResult({ link }: { link: RecordingLink }) {
  const [copied, setCopied] = useState(false);
  const url = link.url || "";
  return (
    <section className="card space-y-3 border-sage/40 bg-sage-soft" aria-live="polite">
      <h2 className="font-semibold text-sage">링크를 만들었어요</h2>
      <p className="text-[0.95rem]">이 링크는 지금 한 번만 보여요. 복사해서 카카오톡이나 문자로 보내 주세요. 받은 분은 로그인 없이 큰 글씨 화면에서 녹음할 수 있어요.</p>
      <input readOnly className="field font-mono text-sm" value={url} onFocus={(e) => e.currentTarget.select()} aria-label="녹음 링크" />
      <div className="flex flex-wrap gap-2">
        <button
          className="btn-primary"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "복사했어요 ✓" : "링크 복사"}
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            className="btn-ghost"
            onClick={() => navigator.share({ title: "여운 — 목소리를 남겨 주세요", text: "질문에 목소리로 답해 주세요.", url }).catch(() => {})}
          >
            공유하기
          </button>
        )}
      </div>
      <p className="text-sm text-ink-soft">{formatDateKo(link.expires_at)}까지 쓸 수 있고, 녹음을 마치면(‘다 했어요’) 다시 쓸 수 없어요.</p>
    </section>
  );
}

export default function AheadPage() {
  const { space } = useSpace();
  const editable = canEdit(space);
  const links = useApi<RecordingLinkList>(editable ? `/spaces/${space.id}/links` : null);
  const [created, setCreated] = useState<RecordingLink | null>(null);

  if (!editable) return <Notice>미리 남기기는 편집 권한이 있는 가족만 보낼 수 있어요.</Notice>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold">목소리를 미리 남겨 두세요</h2>
        <p className="mt-1 text-ink-soft">
          질문 카드를 골라 링크를 보내면, 부모님이 휴대폰에서 질문을 보고 바로 녹음할 수 있어요. 녹음은 원본 그대로 이 공간에 보관되고, 질문과 함께 저장되어 나중에 가장 정확하게 찾을 수 있어요.
        </p>
      </div>
      {created && <NewLinkResult link={created} />}
      <NewLink
        spaceId={space.id}
        onCreated={(l) => {
          setCreated(l);
          void links.reload();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      {links.data && links.data.links.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">보낸 링크</h2>
          <ul className="space-y-3">
            {links.data.links.map((l) => (
              <li key={l.id} className="card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{formatDateKo(l.created_at)} 보냄</span>
                  <span className="chip">{STATUS[l.status]}</span>
                  <span className="text-sm text-ink-soft">
                    {l.answered_count}/{l.questions.length}개 답함
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-[0.95rem]">
                  {l.questions.map((q) => (
                    <li key={q.id} className={q.answered ? "text-sage" : "text-ink-soft"}>
                      {q.answered ? "✓" : "○"} {q.text}
                    </li>
                  ))}
                </ul>
                {l.status === "active" && (
                  <button
                    className="mt-3 text-sm text-ink-faint underline underline-offset-4"
                    onClick={async () => {
                      if (confirm("이 링크를 멈출까요? 더 이상 녹음할 수 없어요.")) {
                        await api.post(`/spaces/${space.id}/links/${l.id}/revoke`).catch(() => {});
                        void links.reload();
                      }
                    }}
                  >
                    링크 멈추기
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
