"use client";

import { useEffect, useRef, useState } from "react";
import { uploadWithProgress } from "@/lib/api";
import type { TranscribeResponse } from "@/lib/api-types.gen";

const MAX_SEC = 60;

/** 음성으로 말 걸기: 녹음 → 받아쓰기 → 입력칸에 채우기. 녹음은 저장하지 않는다. */
export function MicButton({ spaceId, onText }: { spaceId: string; onText: (t: string) => void }) {
  const [state, setState] = useState<"idle" | "recording" | "sending">("idle");
  const [error, setError] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    rec.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  async function start() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("이 브라우저에서는 음성 입력을 쓸 수 없어요. 글로 적어 주세요.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setState("sending");
        const type = r.mimeType || "audio/webm";
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const form = new FormData();
        form.append("audio", new Blob(chunks, { type }), `voice.${ext}`);
        const res = await uploadWithProgress<TranscribeResponse>(`/spaces/${spaceId}/transcribe`, form, () => {});
        if (res.ok && res.data) onText(res.data.text);
        else setError(res.error?.messageKo || "받아쓰지 못했어요.");
        setState("idle");
      };
      rec.current = r;
      r.start();
      setState("recording");
      timer.current = setTimeout(() => r.state === "recording" && r.stop(), MAX_SEC * 1000);
    } catch {
      setError("마이크를 쓸 수 없어요. 브라우저에서 마이크 권한을 허용해 주세요.");
    }
  }

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    if (rec.current?.state === "recording") rec.current.stop();
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={state === "recording" ? stop : start}
        disabled={state === "sending"}
        aria-label={state === "recording" ? "말하기 끝내기" : "음성으로 말하기"}
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl ${
          state === "recording" ? "animate-pulse bg-alert text-white" : "border border-line bg-card text-ink-soft"
        }`}
      >
        {state === "sending" ? "…" : state === "recording" ? "■" : "🎙"}
      </button>
      {error && <span className="mt-1 max-w-48 text-xs text-alert">{error}</span>}
    </div>
  );
}
