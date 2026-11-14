"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Book, BookParagraph, ClipCard, Space } from "@/lib/api-types.gen";
import { ClipPlayer } from "./ClipPlayer";
import { GuideBubble } from "./ClipCardView";
import { ErrorBox, Spinner } from "./Feedback";

/** 목소리가 들리는 기억책. 문단마다 근거가 된 원본 녹음을 바로 들을 수 있다. */
export function BookView({ space, base }: { space: Space; base: string }) {
  const book = useApi<Book>(`/spaces/${space.id}/book`);
  const [busy, setBusy] = useState<"generate" | "approve" | null>(null);
  const [error, setError] = useState<string>();

  const clips = useMemo(() => {
    const m = new Map<string, ClipCard>();
    for (const c of book.data?.clips ?? []) m.set(c.clip_id, c);
    return m;
  }, [book.data]);

  async function generate() {
    if (busy) return;
    setBusy("generate");
    setError(undefined);
    try {
      // 책 한 권을 쓰는 데 시간이 걸려서, 잠든 서버로 착각해 다시 보내지 않는다(중복 생성 방지)
      book.setData(await api.post<Book>(`/spaces/${space.id}/book/generate`, {}, { retryOnWake: false }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function approve() {
    setBusy("approve");
    setError(undefined);
    try {
      book.setData(await api.post<Book>(`/spaces/${space.id}/book/approve`));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  if (book.error) return <ErrorBox message={book.error.messageKo} onRetry={book.reload} />;
  if (!book.data) return <Spinner label={space.is_sample ? "샘플 기억책을 펼치는 중이에요" : "불러오는 중이에요"} />;
  const b = book.data;

  if (busy === "generate")
    return (
      <div className="card space-y-2" role="status">
        <p className="font-semibold">{space.person_name}의 녹음으로 책을 쓰고 있어요…</p>
        <p className="text-ink-soft">녹음을 시기·주제별로 묶고, 문단마다 근거가 된 원본을 붙이는 중이에요. 1분쯤 걸려요.</p>
        <Spinner label="정리하는 중" />
      </div>
    );

  if (!b.exists)
    return (
      <div className="space-y-4">
        <GuideBubble
          text={`${space.person_name}의 실제 녹음을 AI가 시기·주제별로 묶어 책으로 정리해요. 문단마다 [원본 듣기]가 붙고, 근거 녹음이 없는 문장은 따로 표시해요. 가족이 읽고 고친 뒤 승인해야 완성돼요.`}
        />
        {error && <ErrorBox message={error} />}
        {b.can_edit ? (
          b.source_clip_count ? (
            <button className="btn-primary" onClick={generate}>
              녹음 {b.source_clip_count}개로 기억책 만들기
            </button>
          ) : (
            <p className="text-ink-soft">
              책을 만들 녹음이 아직 없어요. ‘자료’에서 녹음을 올리고 ‘목소리 확인’에서 {space.person_name}의 목소리를 골라 주세요.
            </p>
          )
        ) : (
          <p className="text-ink-soft">아직 기억책이 없어요. 편집 권한이 있는 가족이 만들 수 있어요.</p>
        )}
      </div>
    );

  const ratio = b.grounded_ratio != null ? Math.round(b.grounded_ratio * 100) : null;
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-ink-faint">목소리가 들리는 기억책</p>
        <h2 className="font-serif text-2xl font-bold">{b.title}</h2>
        <p className="flex flex-wrap gap-2 text-sm">
          <span className={`rounded-full px-2 py-0.5 ${b.status === "approved" ? "bg-sage-soft text-sage" : "bg-paper text-ink-soft"}`}>
            {b.status === "approved" ? "가족이 승인한 책" : "가족 검수 전 초안"}
          </span>
          {ratio != null && <span className="rounded-full bg-paper px-2 py-0.5 text-ink-soft">근거 있는 문단 {ratio}%</span>}
          {b.generated_by && (
            <span className="rounded-full bg-paper px-2 py-0.5 text-ink-soft">
              {b.generated_by === "mock" ? "원본 인용으로 정리" : "AI가 정리"}
            </span>
          )}
        </p>
      </header>
      {error && <ErrorBox message={error} />}

      {b.chapters.map((ch, i) => (
        <section key={ch.id} className="space-y-4" aria-labelledby={`ch-${ch.id}`}>
          <div>
            <p className="text-sm text-ink-faint">
              {i + 1}장{ch.period ? ` · ${ch.period}` : ""}
            </p>
            <h3 id={`ch-${ch.id}`} className="font-serif text-xl font-bold">
              {ch.title}
            </h3>
          </div>
          {ch.paragraphs.map((p) => (
            <Paragraph key={p.id} p={p} clips={clips} personName={space.person_name} spaceId={space.id} canEdit={b.can_edit} onSaved={book.setData} />
          ))}
          <Link href={`${base}/book/${ch.id}`} className="btn-primary inline-flex">
            📞 이 기억에 대해 통화하기
          </Link>
        </section>
      ))}

      {b.can_edit && (
        <div className="card space-y-3">
          <p className="text-ink-soft">
            AI가 쓴 초안이에요. 사실과 다른 문장은 ‘고치기’로 바로잡고, 괜찮으면 승인해 주세요. 근거 녹음이 없거나 인용이 원본과 다른 문단은 ‘근거 없음’으로 표시돼요.
          </p>
          <div className="flex flex-wrap gap-2">
            {b.status !== "approved" && (
              <button className="btn-primary" onClick={approve} disabled={busy !== null}>
                이 책 승인하기
              </button>
            )}
            <button
              className="btn-ghost"
              disabled={busy !== null}
              onClick={() => {
                if (window.confirm("지금 책을 지우고 녹음으로 다시 만들까요? 고친 문단도 사라져요.")) void generate();
              }}
            >
              다시 만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Paragraph({
  p,
  clips,
  personName,
  spaceId,
  canEdit,
  onSaved,
}: {
  p: BookParagraph;
  clips: Map<string, ClipCard>;
  personName: string;
  spaceId: string;
  canEdit: boolean;
  onSaved: (b: Book) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(p.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const sources = p.clip_ids.map((id) => clips.get(id)).filter((c): c is ClipCard => Boolean(c));

  async function save() {
    setSaving(true);
    setError(undefined);
    try {
      onSaved(await api.patch<Book>(`/spaces/${spaceId}/book/paragraphs/${p.id}`, { text }));
      setEditing(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card space-y-3">
      {editing ? (
        <div className="space-y-2">
          <label htmlFor={`p-${p.id}`} className="sr-only">
            문단 고치기
          </label>
          <textarea
            id={`p-${p.id}`}
            value={text}
            maxLength={1000}
            rows={5}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper p-3 text-lg leading-relaxed"
          />
          {error && <ErrorBox message={error} />}
          <div className="flex gap-2">
            <button className="btn-primary" onClick={save} disabled={saving || !text.trim()}>
              저장
            </button>
            <button className="btn-ghost" onClick={() => { setEditing(false); setText(p.text); }}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="font-serif text-lg leading-relaxed text-ink">{p.text}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {p.grounded ? (
          <button
            type="button"
            aria-expanded={open}
            className="min-h-11 rounded-full bg-accent-soft px-3 font-semibold text-accent-strong"
            onClick={() => setOpen((v) => !v)}
          >
            🎧 원본 듣기 ({sources.length})
          </button>
        ) : (
          <span className="rounded-full bg-alert-soft px-3 py-1 text-alert" title="근거 녹음이 없거나 인용이 원본과 달라요">
            ⚠ 근거 없음
          </span>
        )}
        {p.edited && <span className="rounded-full bg-paper px-2 py-0.5 text-ink-faint">가족이 고침</span>}
        {canEdit && !editing && (
          <button type="button" className="min-h-11 px-2 text-ink-faint underline underline-offset-4" onClick={() => setEditing(true)}>
            고치기
          </button>
        )}
      </div>
      {open && (
        <ul className="space-y-3 border-t border-line pt-3">
          {sources.map((c) => (
            <li key={c.clip_id} className="space-y-1">
              <p className="text-sm text-ink-faint">
                <span className="font-semibold text-accent-strong">{personName}의 목소리</span> · {c.source_label}
              </p>
              <blockquote className="text-ink">“{c.transcript}”</blockquote>
              <ClipPlayer url={c.audio_url} status={c.audio_status} label="원본 듣기" />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
