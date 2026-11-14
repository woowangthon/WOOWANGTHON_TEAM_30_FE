"use client";

import { useAudioToggle } from "@/lib/use-audio-toggle";

/**
 * 'AI가 만든 말'을 그분 목소리로 합성한 음성 재생 부품. (연결은 ChatView 쪽에서 한다)
 * 값이 없으면 아무것도 그리지 않는다. '근거 녹음 보기'와 'AI가 만든 말' 표시는 말풍선 쪽이 그린다.
 * 원본 녹음 버튼(▶, 주황 계열)과 헷갈리지 않게 파란 회색 계열 테두리 버튼과 'AI 합성 음성' 표시를 쓴다.
 */
export function SynthVoiceReply({ synthAudioUrl }: { synthAudioUrl: string | null | undefined }) {
  if (!synthAudioUrl) return null;
  return <Player key={synthAudioUrl} url={synthAudioUrl} />;
}

function Player({ url }: { url: string }) {
  const { playing, failed, toggle } = useAudioToggle(url);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "AI 합성 음성 멈추기" : "AI 합성 음성 듣기"}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors ${
          playing
            ? "border-guide bg-guide text-white"
            : "border-guide/50 bg-guide-soft text-guide hover:border-guide"
        }`}
      >
        <span aria-hidden>{playing ? "❚❚" : "♪"}</span>
        <span>{playing ? "멈추기" : "합성 음성 듣기"}</span>
      </button>
      <span className="rounded-full border border-guide/40 px-2 py-0.5 text-xs font-semibold text-guide">AI 합성 음성</span>
      {failed && (
        <span role="alert" className="w-full text-xs text-alert">
          재생하지 못했어요. 잠시 뒤에 다시 눌러 주세요.
        </span>
      )}
    </div>
  );
}
