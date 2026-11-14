"use client";

import { useAudioToggle } from "@/lib/use-audio-toggle";

/**
 * 여운 안내 말풍선에 넣을 '안내 목소리로 듣기' 버튼. (연결은 말풍선 쪽에서 한다)
 * 값이 없으면 아무것도 그리지 않는다. 그분의 목소리가 아니라 서비스 안내 목소리이므로
 * 원본 녹음 버튼과 다른 모양(글자만 있는 테두리 버튼, 안내 색)으로 그린다.
 */
export function GuideVoiceButton({ guideAudioUrl }: { guideAudioUrl: string | null | undefined }) {
  if (!guideAudioUrl) return null;
  return <Player key={guideAudioUrl} url={guideAudioUrl} />;
}

function Player({ url }: { url: string }) {
  const { playing, failed, toggle } = useAudioToggle(url);
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
          playing
            ? "border-guide bg-guide text-white"
            : "border-guide/40 bg-card text-guide hover:bg-guide-soft"
        }`}
      >
        <span aria-hidden>{playing ? "❚❚" : "🔈"}</span>
        <span>{playing ? "멈추기" : "안내 목소리로 듣기"}</span>
      </button>
      {failed && (
        <span role="alert" className="text-xs text-alert">
          재생하지 못했어요. 잠시 뒤에 다시 눌러 주세요.
        </span>
      )}
    </span>
  );
}
