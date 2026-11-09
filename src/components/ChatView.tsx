"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { AppConfig, ChatResponse, Space } from "@/lib/api-types.gen";
import { ClipCardView, GuideBubble } from "./ClipCardView";
import { CareCard } from "./CareCard";
import { MicButton } from "./MicButton";
import { ErrorBox } from "./Feedback";

interface Turn {
  id: string;
  message: string;
  response?: ChatResponse;
  error?: string;
}

const storeKey = (spaceId: string) => `yeoun.chat.${spaceId}`;

/** 원본 기반 대화. 대화 기록은 이 브라우저 탭에만 잠시 남고 서버에는 저장하지 않는다. */
export function ChatView({ space, canFavorite }: { space: Space; canFavorite: boolean }) {
  const params = useSearchParams();
  const config = useApi<AppConfig>("/config");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

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
      sessionStorage.setItem(storeKey(space.id), JSON.stringify(turns.slice(-20)));
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
    setTurns((t) => [...t, { id, message: m }]);
    setText("");
    setBusy(true);
    try {
      const response = await api.post<ChatResponse>(`/spaces/${space.id}/chat`, { message: m });
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
    <div className="flex flex-col gap-6">
      {turns.length === 0 && (
        <GuideBubble
          text={`${space.person_name}에게 하고 싶은 말을 적어 보세요. 여운은 새 말을 지어내지 않고, 실제 녹음 중에서 가장 가까운 말을 찾아 들려드려요.`}
        />
      )}
      {turns.map((t) => (
        <section key={t.id} className="space-y-3" aria-label="대화">
          <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-paper">{t.message}</p>
          {t.error && <ErrorBox message={t.error} onRetry={() => send(t.message)} />}
          {t.response && (
            <div className="space-y-3">
              {t.response.care && <CareCard care={t.response.care} />}
              <GuideBubble text={t.response.guide.text} />
              {t.response.clips.map((c) => (
                <ClipCardView key={c.clip_id} card={c} spaceId={space.id} personName={space.person_name} canFavorite={canFavorite} />
              ))}
              {t.response.nearby.map((c) => (
                <ClipCardView key={c.clip_id} card={c} spaceId={space.id} personName={space.person_name} canFavorite={canFavorite} nearby />
              ))}
              {t.response.remaining_today != null && t.response.remaining_today <= 10 && (
                <p className="text-sm text-ink-faint">오늘 남은 대화 {t.response.remaining_today}번</p>
              )}
            </div>
          )}
        </section>
      ))}
      {busy && (
        <p role="status" className="text-ink-soft">
          녹음을 찾고 있어요…
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
        <label htmlFor="chat-input" className="sr-only">
          {space.person_name}에게 할 말
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
          placeholder="하고 싶은 말을 적어 주세요"
          className="max-h-40 min-h-14 flex-1 resize-none rounded-2xl px-3 py-3 text-lg focus:outline-none"
        />
        {config.data?.stt_available && <MicButton spaceId={space.id} onText={(t) => setText((v) => (v ? `${v} ${t}` : t))} />}
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
