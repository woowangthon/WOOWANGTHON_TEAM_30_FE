"use client";

import { useEffect, useRef, useState } from "react";
import type { AudioStatus } from "@/lib/api-types.gen";

// 한 번에 하나만 재생한다
let currentAudio: HTMLAudioElement | null = null;

interface Props {
  url?: string | null;
  status: AudioStatus;
  label?: string;
  size?: "md" | "lg";
  onEnded?: () => void;
}

/** 원본 녹음 클립 재생 버튼. 샘플 녹음이 아직 없으면 '샘플 녹음 준비 중'을 보여 준다. */
export function ClipPlayer({ url, status, label = "듣기", size = "md", onEnded }: Props) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      if (audio.current) {
        audio.current.pause();
        if (currentAudio === audio.current) currentAudio = null;
      }
    };
  }, []);

  if (status === "placeholder") {
    return (
      <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-paper px-4 text-sm text-ink-faint">
        <span aria-hidden>🎙</span> 샘플 녹음 준비 중
      </span>
    );
  }
  if (status !== "ready" || !url) {
    return <span className="text-sm text-ink-faint">재생할 녹음이 없어요</span>;
  }

  const toggle = () => {
    if (!audio.current) {
      const a = new Audio(url);
      a.preload = "auto";
      a.ontimeupdate = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
      a.onended = () => {
        setPlaying(false);
        setProgress(0);
        onEnded?.();
      };
      a.onpause = () => setPlaying(false);
      a.onplay = () => setPlaying(true);
      a.onerror = () => {
        setFailed(true);
        setPlaying(false);
      };
      audio.current = a;
    }
    const a = audio.current;
    if (playing) {
      a.pause();
      return;
    }
    if (currentAudio && currentAudio !== a) currentAudio.pause();
    currentAudio = a;
    setFailed(false);
    a.play().catch(() => setFailed(true));
  };

  const big = size === "lg";
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full font-semibold transition-colors ${
          big ? "min-h-14 px-6 text-lg" : "min-h-11 px-4"
        } ${playing ? "bg-accent text-white" : "bg-accent-soft text-accent-strong hover:bg-[#ecd6c7]"}`}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 bg-black/10"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
        <span className="relative" aria-hidden>
          {playing ? "❚❚" : "▶"}
        </span>
        <span className="relative">{playing ? "멈추기" : label}</span>
      </button>
      {failed && <span className="text-xs text-alert">재생하지 못했어요. 화면을 새로 고쳐 주세요.</span>}
    </span>
  );
}
