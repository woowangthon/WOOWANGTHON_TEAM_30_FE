"use client";

import { useEffect, useRef, useState } from "react";

// 음성 부품들(SynthVoiceReply, GuideVoiceButton, VoiceRefPicker)이 함께 쓰는 재생 토글.
// 한 번에 하나만 재생한다. 주소(url)가 바뀌면 부르는 쪽에서 key 로 컴포넌트를 새로 만든다.
let currentAudio: HTMLAudioElement | null = null;

export function useAudioToggle(url: string | null | undefined) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    return () => {
      const a = audio.current;
      if (a) {
        a.pause();
        if (currentAudio === a) currentAudio = null;
      }
    };
  }, []);

  const toggle = () => {
    if (!url) return;
    if (!audio.current) {
      const a = new Audio(url);
      a.preload = "auto";
      a.onended = () => setPlaying(false);
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

  return { playing, failed, toggle };
}
