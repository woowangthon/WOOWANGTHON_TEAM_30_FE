"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError, errorMessage, uploadWithProgress } from "@/lib/api";
import type { LinkQuestion, RecorderSession } from "@/lib/api-types.gen";
import { extensionFor, formatClock, pickMimeType } from "@/lib/recorder";

type Phase = "loading" | "invalid" | "consent" | "record" | "done";
type QState = "idle" | "recording" | "recorded" | "sending" | "sent";

/**
 * 미리 남기기 — 녹음하는 분(부모님) 화면. 로그인 없이, 큰 글씨·큰 버튼.
 */
export default function RecorderPage() {
  const { token } = useParams<{ token: string }>();
  const [session, setSession] = useState<RecorderSession | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [qstate, setQstate] = useState<QState>("idle");
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api
      .get<RecorderSession>(`/record/${token}`)
      .then((s) => {
        setSession(s);
        setAnswered(Object.fromEntries(s.questions.map((q) => [q.id, q.answered])));
        const first = s.questions.findIndex((q) => !q.answered);
        setIndex(first >= 0 ? first : 0);
        setPhase("consent");
      })
      .catch((e) => {
        setError(e instanceof ApiError ? e.messageKo : "링크를 열 수 없어요.");
        setPhase("invalid");
      });
  }, [token]);

  useEffect(() => () => {
    if (tick.current) clearInterval(tick.current);
    rec.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const resetTake = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlob(null);
    setBlobUrl(null);
    setSeconds(0);
    setProgress(0);
    setQstate("idle");
  }, [blobUrl]);

  if (phase === "loading") return <Frame><p>불러오는 중이에요…</p></Frame>;
  if (phase === "invalid" || !session)
    return (
      <Frame>
        <h1 className="text-[1.6em] font-bold">링크를 열 수 없어요</h1>
        <p className="mt-4">{error}</p>
      </Frame>
    );

  const questions = session.questions;
  const q: LinkQuestion | undefined = questions[index];
  const doneCount = Object.values(answered).filter(Boolean).length;

  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("이 휴대폰 브라우저에서는 녹음을 할 수 없어요. 크롬이나 사파리로 열어 주세요.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMimeType((t) => MediaRecorder.isTypeSupported(t));
      const r = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (tick.current) clearInterval(tick.current);
        const b = new Blob(chunks, { type: r.mimeType || mime || "audio/webm" });
        setBlob(b);
        setBlobUrl(URL.createObjectURL(b));
        setQstate("recorded");
      };
      rec.current = r;
      r.start(1000);
      setSeconds(0);
      setQstate("recording");
      const max = session!.max_seconds;
      tick.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= max && r.state === "recording") r.stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("마이크를 쓸 수 없어요. 화면 위쪽에 마이크 허용을 눌러 주세요.");
    }
  }

  function stopRecording() {
    if (rec.current?.state === "recording") rec.current.stop();
  }

  async function send() {
    if (!blob || !q) return;
    setQstate("sending");
    setError("");
    const form = new FormData();
    form.append("question_id", q.id);
    form.append("audio", blob, `answer.${extensionFor(blob.type)}`);
    const res = await uploadWithProgress(`/record/${token}/answers`, form, setProgress);
    if (res.ok) {
      setAnswered((a) => ({ ...a, [q.id]: true }));
      setQstate("sent");
    } else {
      setError(res.error?.messageKo || "보내지 못했어요. 다시 눌러 주세요.");
      setQstate("recorded");
    }
  }

  function next() {
    resetTake();
    const after = questions.findIndex((x, i) => i > index && !answered[x.id]);
    const any = questions.findIndex((x) => !answered[x.id]);
    setIndex(after >= 0 ? after : any >= 0 ? any : Math.min(index + 1, questions.length - 1));
  }

  async function finish() {
    try {
      await api.post(`/record/${token}/complete`);
      setPhase("done");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  if (phase === "done") {
    return (
      <Frame>
        <h1 className="text-[1.6em] font-bold">고맙습니다</h1>
        <p className="mt-4">
          들려주신 목소리는 {session.sender_name || "보낸 분"}님께 원본 그대로 소중히 전해졌어요. 이제 이 화면을 닫으셔도 돼요.
        </p>
      </Frame>
    );
  }

  if (phase === "consent") {
    return (
      <Frame>
        <p className="text-ink-soft">{session.sender_name || "가족"}님이 보낸 질문이에요</p>
        <h1 className="mt-2 text-[1.6em] font-bold leading-snug">목소리로 이야기를 남겨 주세요</h1>
        {session.message && <p className="mt-4 rounded-2xl bg-accent-soft p-4">“{session.message}”</p>}
        <p className="mt-4">질문이 {questions.length}개 있어요. 하나씩 천천히 답해 주시면 돼요. 하고 싶지 않은 질문은 넘어가도 괜찮아요.</p>
        <div className="mt-6 rounded-2xl border border-line bg-card p-4 text-[0.85em] leading-relaxed text-ink-soft">
          <p className="mb-2 font-semibold text-ink">녹음하기 전에 읽어 주세요</p>
          {session.consent_text}
        </div>
        {error && <p className="mt-4 text-alert">{error}</p>}
        <button
          className="mt-6 min-h-16 w-full rounded-2xl bg-accent text-[1.1em] font-bold text-white"
          onClick={async () => {
            try {
              await api.post(`/record/${token}/consent`);
              setPhase("record");
            } catch (e) {
              setError(errorMessage(e));
            }
          }}
        >
          네, 이해했어요. 시작할게요
        </button>
      </Frame>
    );
  }

  return (
    <Frame>
      <p className="text-ink-soft">
        질문 {index + 1} / {questions.length} · 답한 질문 {doneCount}개
      </p>
      <h1 className="mt-3 text-[1.5em] font-bold leading-snug">{q?.text}</h1>
      {answered[q?.id || ""] && qstate === "idle" && <p className="mt-2 text-sage">이미 답하신 질문이에요. 다시 녹음하면 새 녹음으로 바뀌어요.</p>}

      <div className="mt-8 flex flex-col items-center gap-4">
        {qstate === "idle" && (
          <button onClick={startRecording} className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-alert text-white shadow-lg" aria-label="녹음 시작">
            <span className="text-[2em]" aria-hidden>●</span>
            <span className="font-bold">녹음 시작</span>
          </button>
        )}
        {qstate === "recording" && (
          <>
            <p className="text-[1.6em] font-bold tabular-nums" aria-live="polite">
              {formatClock(seconds)}
            </p>
            <button onClick={stopRecording} className="flex h-40 w-40 animate-pulse flex-col items-center justify-center rounded-full bg-ink text-white shadow-lg" aria-label="녹음 멈추기">
              <span className="text-[2em]" aria-hidden>■</span>
              <span className="font-bold">다 말했어요</span>
            </button>
            <p className="text-ink-soft">최대 {Math.round(session.max_seconds / 60)}분까지 녹음돼요</p>
          </>
        )}
        {(qstate === "recorded" || qstate === "sending") && blobUrl && (
          <div className="w-full space-y-3">
            <audio controls src={blobUrl} className="w-full" />
            <button onClick={send} disabled={qstate === "sending"} className="min-h-16 w-full rounded-2xl bg-accent text-[1.1em] font-bold text-white">
              {qstate === "sending" ? `보내는 중 ${Math.round(progress * 100)}%` : "이대로 보내기"}
            </button>
            <button onClick={resetTake} disabled={qstate === "sending"} className="min-h-14 w-full rounded-2xl border border-line bg-card font-semibold">
              다시 녹음하기
            </button>
          </div>
        )}
        {qstate === "sent" && <p className="text-[1.2em] font-bold text-sage">보냈어요 ✓</p>}
      </div>
      {error && <p className="mt-4 text-alert" role="alert">{error}</p>}

      <div className="mt-10 grid grid-cols-1 gap-3">
        {(qstate === "idle" || qstate === "sent") && doneCount < questions.length && (
          <button onClick={next} className="min-h-14 rounded-2xl border border-line bg-card font-semibold">
            {qstate === "sent" ? "다음 질문" : "이 질문은 넘어갈게요"}
          </button>
        )}
        {(qstate === "idle" || qstate === "sent") && doneCount > 0 && (
          <button onClick={finish} className="min-h-14 rounded-2xl bg-sage font-semibold text-white">
            다 했어요 (마치기)
          </button>
        )}
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh max-w-xl px-5 py-10 text-[1.25rem] leading-relaxed">
      <p className="mb-6 font-serif text-[1.1em] font-bold text-accent-strong">여운</p>
      {children}
    </main>
  );
}
