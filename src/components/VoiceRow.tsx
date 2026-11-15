"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipCard } from "@/lib/api-types.gen";
import { Icon } from "./Icons";

// 홈의 목소리 줄은 한 번에 하나만 재생한다
let current: HTMLAudioElement | null = null;

function bars(seed: string, n: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const r = ((h >>> 0) % 1000) / 1000;
    // 가운데가 조금 더 높은 모양
    const env = 0.55 + 0.45 * Math.sin((Math.PI * (i + 0.5)) / n);
    out.push(Math.max(0.18, r * env));
  }
  return out;
}

export function clock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function dotDate(iso?: string | null): string {
  return iso ? iso.slice(0, 10).replaceAll("-", ".") : "날짜 모름";
}

function shortQuote(t: string, max = 17): string {
  const s = t.trim().replace(/\s+/g, " ");
  return s.length > max ? `${s.slice(0, max).trim()}…` : s;
}

/** 녹음 한 줄: 재생 버튼, 첫 말, 누가·언제, 파형(장식, 재생한 만큼 진하게), 길이. */
export function VoiceRow({ clip, personName }: { clip: ClipCard; personName: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const wave = useMemo(() => bars(clip.clip_id, 42), [clip.clip_id]);
  const duration = clip.end_sec - clip.start_sec;
  const ready = clip.audio_status === "ready" && !!clip.audio_url;

  useEffect(() => () => {
    audio.current?.pause();
    if (current === audio.current) current = null;
  }, []);

  const toggle = () => {
    if (!ready) return;
    if (!audio.current) {
      const a = new Audio(clip.audio_url!);
      a.ontimeupdate = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
      a.onplay = () => setPlaying(true);
      a.onpause = () => setPlaying(false);
      a.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
      a.onerror = () => {
        setFailed(true);
        setPlaying(false);
      };
      audio.current = a;
    }
    const a = audio.current;
    if (playing) return a.pause();
    if (current && current !== a) current.pause();
    current = a;
    setFailed(false);
    a.play().catch(() => setFailed(true));
  };

  const played = Math.round(progress * wave.length);
  return (
    <div className="flex items-center gap-4 py-5">
      <button
        type="button"
        onClick={toggle}
        disabled={!ready}
        aria-pressed={playing}
        aria-label={ready ? `${playing ? "멈추기" : "듣기"}: ${clip.transcript}` : "샘플 녹음 준비 중"}
        title={ready ? undefined : "샘플 녹음 준비 중"}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-strong disabled:bg-accent/45"
      >
        <Icon name={playing ? "pause" : "play"} size={18} className={playing ? "" : "translate-x-[1px]"} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[1.08rem] font-bold text-ink">“{shortQuote(clip.transcript)}”</p>
        <p className="mt-0.5 text-sm text-ink-soft">
          {personName} <span className="mx-1 text-ink-faint">·</span> {dotDate(clip.date)}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <svg viewBox={`0 0 ${wave.length * 5} 24`} className="h-6 min-w-0 flex-1" preserveAspectRatio="none" aria-hidden="true">
            {wave.map((v, i) => {
              const h = v * 22;
              return <rect key={i} x={i * 5 + 1} y={12 - h / 2} width="2.4" height={h} rx="1.2" className={i < played ? "fill-accent-strong" : "fill-accent/45"} />;
            })}
          </svg>
          <span className="shrink-0 text-sm tabular-nums text-ink-soft">{clock(duration)}</span>
        </div>
        {failed && <p className="mt-1 text-xs text-alert">재생하지 못했어요. 화면을 새로 고쳐 주세요.</p>}
      </div>
    </div>
  );
}
