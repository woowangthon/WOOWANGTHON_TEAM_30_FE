"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { AppConfig, ClipCard, Space, TalkResponse, TalkTurn } from "@/lib/api-types.gen";
import { GuideBubble } from "./ClipCardView";
import { CareCard } from "./CareCard";
import { ClipPlayer } from "./ClipPlayer";
import { MicButton } from "./MicButton";
import { ErrorBox } from "./Feedback";

interface Turn {
  id: string;
  message: string;
  response?: TalkResponse;
  error?: string;
}

const storeKey = (spaceId: string) => `yeoun.talk.${spaceId}`;

/**
 * 그 사람과 메신저처럼 대화하기. 답장은 하나:
 * 녹음에 그대로 있는 말이면 실제 목소리(▶), 아니면 그 사람 말투로 만든 말('AI가 만든 말' + 근거).
 * 대화 기록은 이 브라우저 탭에만 잠시 남고 서버에는 저장하지 않는다.
 */
export function ChatView({ space }: { space: Space; canFavorite?: boolean }) {
  const params = useSearchParams();
  const config = useApi<AppConfig>("/config");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);
  const person = space.person_name;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storeKey(space.id));
      if (saved) setTurns(JSON.parse(saved));
    } catch {
      /* 무시 */
    }
  }, [space.id]);

  useEffect(() => {
    try {
      sessionStorage.setItem(storeKey(space.id), JSON.stringify(turns.slice(-30)));
    } catch {
      /* 무시 */
    }
  }, [turns, space.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, busy]);

  async function send(message: string) {
    const m = message.trim();
    if (!m || busy) return;
    const id = `${Date.now()}`;
    const history: TalkTurn[] = turns
      .filter((t) => t.response && t.response.mode !== "crisis")
      .slice(-4)
      .flatMap((t) => [
        { role: "user" as const, text: t.message },
        { role: "reply" as const, text: t.response!.text },
      ]);
    setTurns((t) => [...t, { id, message: m }]);
    setText("");
    setBusy(true);
    try {
      const response = await api.post<TalkResponse>(`/spaces/${space.id}/talk`, { message: m, history });
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, response } : x)));
    } catch (e) {
      setTurns((t) => t.map((x) => (x.id === id ? { ...x, error: errorMessage(e) } : x)));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const q = params.get("q");
    if (q && !sentInitial.current) {
      sentInitial.current = true;
      void send(q);
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-ink-soft" role="note">
        {person}의 실제 녹음으로 이어 가는 대화예요. 녹음에 그대로 있는 말은 <b className="text-accent-strong">▶ 실제 목소리</b>로, 녹음에 없는 말은{" "}
        <b className="text-guide">AI가 만든 말</b>로 표시하고 근거 녹음을 함께 보여 드려요.
      </p>

      {turns.length === 0 && (
        <PersonBubble person={person}>
          <p className="text-ink-soft">{person}에게 하고 싶은 말을 보내 보세요.</p>
        </PersonBubble>
      )}

      {turns.map((t) => (
        <section key={t.id} className="space-y-3" aria-label="대화">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-paper">{t.message}</p>
          {t.error && <ErrorBox message={t.error} onRetry={() => send(t.message)} />}
          {t.response && <Reply r={t.response} person={person} />}
        </section>
      ))}

      {busy && (
        <PersonBubble person={person}>
          <p role="status" className="text-ink-faint">
            답장을 쓰고 있어요 <span className="animate-pulse">…</span>
          </p>
        </PersonBubble>
      )}
      <div ref={bottom} />

      <form
        className="sticky bottom-3 z-30 flex items-end gap-2 rounded-3xl border border-line bg-card p-2 shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          {person}에게 할 말
        </label>
        <textarea
          id="chat-input"
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
          placeholder="메시지를 적어 주세요"
          className="max-h-40 min-h-14 flex-1 resize-none rounded-2xl px-3 py-3 text-lg focus:outline-none"
        />
        {config.data?.stt_available && <MicButton spaceId={space.id} onText={(v) => setText((x) => (x ? `${x} ${v}` : v))} />}
        <button className="btn-primary h-14" disabled={busy || !text.trim()}>
          보내기
        </button>
      </form>
      {turns.length > 0 && (
        <button
          type="button"
          className="self-center text-sm text-ink-faint underline underline-offset-4"
          onClick={() => setTurns([])}
        >
          이 대화 지우기
        </button>
      )}
    </div>
  );
}

function PersonBubble({ person, children, dashed }: { person: string; children: React.ReactNode; dashed?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-strong"
      >
        {person.slice(0, 1)}
      </span>
      <div className="min-w-0 max-w-[85%] space-y-1">
        <p className="text-xs text-ink-faint">{person}</p>
        <div
          className={`space-y-2 rounded-2xl rounded-tl-md bg-card px-4 py-3 ${
            dashed ? "border-2 border-dashed border-guide/40" : "border border-line"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Reply({ r, person }: { r: TalkResponse; person: string }) {
  if (r.mode === "crisis")
    return (
      <div className="space-y-3">
        <GuideBubble text={r.text} />
        {r.care && <CareCard care={r.care} />}
      </div>
    );
  if (r.mode === "guide")
    return (
      <div className="space-y-3">
        {r.care && <CareCard care={r.care} />}
        <GuideBubble text={r.text} />
      </div>
    );
  const clip = r.clips[0];
  return (
    <div className="space-y-3">
      {r.care && <CareCard care={r.care} />}
      {r.mode === "original" && clip ? (
        <PersonBubble person={person}>
          <p className="font-serif text-lg leading-relaxed text-ink">{clip.transcript}</p>
          <div className="flex flex-wrap items-center gap-2">
            <ClipPlayer url={clip.audio_url} status={clip.audio_status} label="실제 목소리" />
            <span className="text-xs text-ink-faint">실제 녹음 · {clip.source_label}</span>
          </div>
        </PersonBubble>
      ) : (
        <PersonBubble person={person} dashed>
          <p className="text-lg leading-relaxed text-ink">{r.text}</p>
          {/* 합성 음성 자리: 태효 쪽 SynthVoiceReply 컴포넌트를 여기에 붙인다 ('AI 합성 음성' 표시 유지). 지금은 연결하지 않음. */}
          <Sources sources={r.sources} person={person} />
        </PersonBubble>
      )}
    </div>
  );
}

function Sources({ sources, person }: { sources: ClipCard[]; person: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-guide px-2 py-0.5 font-semibold text-white">AI가 만든 말</span>
        <button
          type="button"
          aria-expanded={open}
          className="min-h-9 text-guide underline underline-offset-4"
          onClick={() => setOpen((v) => !v)}
        >
          근거 녹음 {sources.length}개 보기
        </button>
      </p>
      {open && (
        <ul className="space-y-3 border-t border-line pt-2">
          {sources.map((c) => (
            <li key={c.clip_id} className="space-y-1 text-sm">
              <p className="text-ink-faint">
                <span className="font-semibold text-accent-strong">{person}의 실제 녹음</span> · {c.source_label}
              </p>
              <blockquote className="text-ink">“{c.transcript}”</blockquote>
              <ClipPlayer url={c.audio_url} status={c.audio_status} label="듣기" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
