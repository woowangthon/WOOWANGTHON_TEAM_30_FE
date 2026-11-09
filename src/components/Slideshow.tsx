"use client";

import { useEffect, useRef, useState } from "react";
import type { ClipCard, PhotoRef } from "@/lib/api-types.gen";

/**
 * 사진 슬라이드 + 원본 음성 (P1). 사진을 천천히 넘기면서 같은 날의 실제 녹음 클립을 차례로 들려준다.
 * 녹음이 아직 없는 클립(샘플)은 자막만 6초 보여 준다.
 */
export function Slideshow({ photos, clips, personName, onClose }: { photos: PhotoRef[]; clips: ClipCard[]; personName: string; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [clipIdx, setClipIdx] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => setPhotoIdx((i) => (i + 1) % photos.length), 6000);
    return () => clearInterval(id);
  }, [photos.length]);

  useEffect(() => {
    const clip = clips[clipIdx];
    if (!clip) return;
    const next = () => setClipIdx((i) => (i + 1 < clips.length ? i + 1 : i));
    if (clip.audio_status === "ready" && clip.audio_url) {
      const a = new Audio(clip.audio_url);
      audio.current = a;
      a.onended = () => setTimeout(next, 1200);
      a.play().catch(() => setTimeout(next, 6000));
      return () => a.pause();
    }
    const t = setTimeout(next, 6000);
    return () => clearTimeout(t);
  }, [clipIdx, clips]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const photo = photos[photoIdx];
  const clip = clips[clipIdx];
  return (
    <div role="dialog" aria-modal="true" aria-label="사진과 함께 듣기" className="fixed inset-0 z-50 flex flex-col bg-[#1d1a17] text-white">
      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-white/70">사진과 함께 듣기</span>
        <button onClick={onClose} className="min-h-11 rounded-full bg-white/10 px-4">닫기</button>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={photo.asset_id} src={photo.url} alt={photo.caption || "사진"} className="max-h-full max-w-full rounded-2xl object-contain transition-opacity duration-700" />
        ) : (
          <div className="text-white/50">사진이 없어요</div>
        )}
      </div>
      <div className="space-y-2 p-6">
        {photo?.caption && <p className="text-sm text-white/60">{photo.caption}</p>}
        {clip && (
          <>
            <p className="text-sm text-[#e9c9b4]">
              {personName}의 목소리 · {clip.source_label} {clip.audio_status === "placeholder" ? "· 샘플 녹음 준비 중" : ""}
            </p>
            <p className="font-serif text-xl leading-relaxed">“{clip.transcript}”</p>
            <p className="text-sm text-white/50">
              {clipIdx + 1} / {clips.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
