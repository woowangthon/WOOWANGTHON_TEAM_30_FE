"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { AppConfig, Book, CallResponse, CallTurn, Space } from "@/lib/api-types.gen";
import { ClipCardView, GuideBubble } from "./ClipCardView";
import { CareCard } from "./CareCard";
import { ClipPlayer } from "./ClipPlayer";
import { MicButton } from "./MicButton";
import { ErrorBox, Spinner } from "./Feedback";

interface Turn {
  id: string;
  message: string;
  response?: CallResponse;
  error?: string;
}

/**
 * 기억 통화: 책의 한 장에서만 열린다. 원본이 있으면 원본을 먼저 들려주고,
 * 없으면 그 장의 녹음을 근거로 만든 말을 'AI 생성'으로 표시하고 근거를 함께 보여 준다.
 */
export function CallView({ space, base, chapterId }: { space: Space; base: string; chapterId: string }) {
  const book = useApi<Book>(`/spaces/${space.id}/book`);
  const config = useApi<AppConfig>("/config");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const chapter = book.data?.chapters.find((c) => c.id === chapterId);
  const person = space.person_name;

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, busy]);

  async function send(message: string) {
    const m = message.trim();
    if (!m || busy) return;
    const id = `${Date.now()}`;
    const history: CallTurn[] = turns
      .filter((t) => t.response)
      .slice(-3)
      .flatMap((t) => [
        { role: "user" as const, text: t.message },
        { role: "reply" as const, text: t.response!.mode === "original" ? t.response!.clips.map((c) => c.transcript).join(" ") : t.response!.text },
      ]);
    setTurns((t) => [...t, { id, message: m }]);
    setText("");
    setBusy(true);
    try {
      const response = await api.post<CallResponse>(`/spaces/${space.id}/book/chapters/${chapterId}/call`, { message: m, history });
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, response } : x)));
    } catch (e) {
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, error: errorMessage(e) } : x)));
    } finally {
      setBusy(false);
    }
  }

  if (book.error) return <ErrorBox message={book.error.messageKo} onRetry={book.reload} />;
  if (!book.data) return <Spinner />;
  if (!chapter)
    return (
      <div className="space-y-3">
        <ErrorBox message="이 장을 찾을 수 없어요. 책이 다시 만들어졌을 수 있어요." />
        <Link href={`${base}/book`} className="btn-ghost inline-flex">
          기억책으로 돌아가기
        </Link>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <Link href={`${base}/book`} className="text-sm text-ink-faint underline underline-offset-4">
          ← 기억책
        </Link>
        <h2 className="font-serif text-2xl font-bold">📞 {person}과(와)의 기억 통화</h2>
        <p className="text-ink-soft">
          {chapter.period ? `${chapter.period} · ` : ""}
          {chapter.title}
        </p>
      </header>
      <div className="rounded-2xl border border-line bg-card p-4 text-sm text-ink-soft" role="note">
        이 장의 기억에 대해서만 이야기해요. <b className="text-accent-strong">원본</b> 녹음이 있으면 실제 목소리를 먼저 들려드리고, 녹음에 없는 말은{" "}
        <b className="text-guide">AI 생성</b>으로 표시해 근거 녹음과 함께 보여 드려요. 유언·돈 이야기나 {person}의 판단은 대신 말하지 않아요.
      </div>

      {turns.length === 0 && <GuideBubble text={`이 기억을 떠올리며 ${person}에게 하고 싶은 말을 건네 보세요.`} />}

      {turns.map((t) => (
        <section key={t.id} className="space-y-3" aria-label="통화">
          <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-paper">{t.message}</p>
          {t.error && <ErrorBox message={t.error} onRetry={() => send(t.message)} />}
          {t.response && <Reply r={t.response} spaceId={space.id} person={person} />}
        </section>
      ))}
      {busy && (
        <p role="status" className="text-ink-soft">
          {person}의 녹음을 찾고 있어요…
        </p>
      )}
      <div ref={bottom} />

      <form
        className="sticky bottom-3 z-30 flex items-end gap-2 rounded-3xl border border-line bg-card p-2 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
      >
        <label htmlFor="call-input" className="sr-only">
          {person}에게 할 말
        </label>
        <textarea
          id="call-input"
          rows={1}
          maxLength={500}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send(text);
            }
          }}
          placeholder="하고 싶은 말을 적어 주세요"
          className="max-h-40 min-h-14 flex-1 resize-none rounded-2xl px-3 py-3 text-lg focus:outline-none"
        />
        {config.data?.stt_available && <MicButton spaceId={space.id} onText={(v) => setText((x) => (x ? `${x} ${v}` : v))} />}
        <button className="btn-primary h-14" disabled={busy || !text.trim()}>
          보내기
        </button>
      </form>
    </div>
  );
}

function Reply({ r, spaceId, person }: { r: CallResponse; spaceId: string; person: string }) {
  const [showSources, setShowSources] = useState(false);
  if (r.mode === "crisis")
    return (
      <div className="space-y-3">
        <GuideBubble text={r.text} />
        {r.care && <CareCard care={r.care} />}
      </div>
    );
  return (
    <div className="space-y-3">
      {r.care && <CareCard care={r.care} />}
      {r.mode === "original" && (
        <>
          <p className="text-sm font-semibold text-accent-strong">● 원본 · {r.text}</p>
          {r.clips.map((c) => (
            <ClipCardView key={c.clip_id} card={c} spaceId={spaceId} personName={person} canFavorite={false} />
          ))}
        </>
      )}
      {r.mode === "generated" && (
        <article className="space-y-3 rounded-2xl border-2 border-dashed border-guide/40 bg-card p-4" aria-label="AI가 만든 말">
          <p className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-guide px-2 py-0.5 text-xs font-semibold text-white">AI 생성</span>
            <span className="text-ink-faint">{person}의 녹음을 근거로 만든 말이에요. 실제로 하신 말이 아니에요.</span>
          </p>
          <p className="font-serif text-lg leading-relaxed text-ink">{r.text}</p>
          <button
            type="button"
            aria-expanded={showSources}
            className="min-h-11 text-sm text-guide underline underline-offset-4"
            onClick={() => setShowSources((v) => !v)}
          >
            이 말은 어디서 왔어? (근거 녹음 {r.sources.length}개)
          </button>
          {showSources && (
            <ul className="space-y-3 border-t border-line pt-3">
              {r.sources.map((c) => (
                <li key={c.clip_id} className="space-y-1">
                  <p className="text-sm text-ink-faint">
                    <span className="font-semibold text-accent-strong">{person}의 목소리</span> · {c.source_label}
                  </p>
                  <blockquote className="text-ink">“{c.transcript}”</blockquote>
                  <ClipPlayer url={c.audio_url} status={c.audio_status} label="원본 듣기" />
                </li>
              ))}
            </ul>
          )}
        </article>
      )}
      {r.mode === "guide" && <GuideBubble text={r.text} />}
    </div>
  );
}
