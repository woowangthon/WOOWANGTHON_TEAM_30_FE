"use client";

import { useEffect, useRef, useState } from "react";

// 음성 부품들(SynthVoiceReply, GuideVoiceButton, VoiceRefPicker)이 함께 쓰는 재생 토글.
// 한 번에 하나만 재생한다. 주소(url)가 바뀌면 부르는 쪽에서 key 로 컴포넌트를 새로 만든다.
let currentAudio: HTMLAudioElement | null = null;

// 문서 안의 다른 <audio> 가 재생을 시작하면 우리 소리를 멈춘다(capture 단계 play 이벤트).
// 화면에 붙지 않은 new Audio() 로 만든 소리(예: ClipPlayer)는 이 이벤트가 문서까지 오지 않아 잡지 못한다.
let listening = false;
function listenOtherPlayers() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener(
    "play",
    (e) => {
      if (currentAudio && e.target !== currentAudio) currentAudio.pause();
    },
    true,
  );
}

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
    listenOtherPlayers();
    setFailed(false);
    a.play().catch((err: unknown) => {
      // 재생이 시작되기 전에 멈춘 경우(AbortError)는 오류가 아니다
      if (err instanceof DOMException && err.name === "AbortError") return;
      setFailed(true);
    });
  };

  return { playing, failed, toggle };
}
