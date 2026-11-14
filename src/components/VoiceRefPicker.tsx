"use client";

import { useId, useState } from "react";
import { formatDuration } from "@/lib/format";
import { useAudioToggle } from "@/lib/use-audio-toggle";
import { clipDurationSec, canApprovePreview, pickByIds, summarizeRefClips, type VoiceRefClip } from "@/lib/voice-ref";

export type VoicePreviewStatus = "idle" | "loading" | "ready" | "error";

interface Props {
  /** 그분으로 확인된 클립 목록 */
  clips: VoiceRefClip[];
  /** 선택된 클립 id */
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  /** '이 목소리로 들어 보기' — 합성은 부르는 쪽이 한다 */
  onPreview: (ids: string[]) => void;
  /** '그분 같아요' — 넘어오는 id 는 현재 선택이 아니라 '미리 들은' 구간이다 */
  onApprove: (ids: string[]) => void;
  /** '다시 고를게요' */
  onReject: () => void;
  /** 미리 듣기 상태. 부르는 쪽이 관리한다 */
  previewStatus?: VoicePreviewStatus;
  /** 합성된 미리 듣기 음성(data: 주소 등) */
  previewAudioUrl?: string | null;
  /** 그 음성을 만든 참조 클립 id. 음성 주소와 반드시 함께 넘긴다(없으면 승인 버튼이 나오지 않는다) */
  previewIds?: readonly string[] | null;
  /** 미리 듣기 실패 때 보여 줄 말 */
  previewError?: string | null;
  /** 승인 처리 중 등으로 모든 버튼을 잠글 때 */
  disabled?: boolean;
}

/**
 * 가족이 합성에 쓸 '참조 구간'을 고르는 화면 부품. props 로만 동작하고 API 를 부르지 않는다.
 * 어디에도 연결하지 않았다. 드래그·파형 편집은 없다.
 */
export function VoiceRefPicker({
  clips,
  selectedIds,
  onSelectedChange,
  onPreview,
  onApprove,
  onReject,
  previewStatus = "idle",
  previewAudioUrl,
  previewIds,
  previewError,
  disabled = false,
}: Props) {
  const headingId = useId();
  const picked = pickByIds(clips, selectedIds);
  const sum = summarizeRefClips(picked);
  const pickedIds = picked.map((c) => c.id);
  const [rejectedUrl, setRejectedUrl] = useState<string | null>(null);
  const loading = previewStatus === "loading";
  const canApprove = canApprovePreview({
    status: previewStatus,
    audioUrl: previewAudioUrl,
    previewIds,
    selectedIds: pickedIds,
    rejectedUrl,
  });
  // 음성은 있는데 지금 선택과 맞지 않을 때만 안내한다(거절한 음성은 조용히 숨긴다)
  const changed =
    previewStatus === "ready" && !!previewAudioUrl && previewAudioUrl !== rejectedUrl && !canApprove;

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...selectedIds.filter((x) => x !== id), id] : selectedIds.filter((x) => x !== id);
    onSelectedChange(next);
  };

  return (
    <section aria-labelledby={headingId} aria-busy={loading} className="space-y-5">
      <h2 id={headingId} className="font-serif text-xl font-bold">
        그분 목소리만 또렷하게 들리는 부분을 골라 주세요
      </h2>

      {clips.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card px-4 py-3 text-ink-soft">고를 수 있는 부분이 아직 없어요.</p>
      ) : (
        <ul className="space-y-3">
          {clips.map((c, i) => {
            const on = selectedIds.includes(c.id);
            const checkId = `${headingId}-check-${c.id}`;
            const textId = `${headingId}-text-${c.id}`;
            const order = `${i + 1}번째 녹음, ${Math.floor(clipDurationSec(c))}초`;
            return (
              <li
                key={c.id}
                className={`rounded-2xl border p-4 ${on ? "border-sage bg-sage-soft/50" : "border-line bg-card"}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <ClipPlayButton key={c.audio_url ?? c.id} clip={c} order={order} describedBy={textId} />
                  <span className="text-sm text-ink-soft">{formatDuration(clipDurationSec(c))}</span>
                </div>
                <p id={textId} className="mt-2 whitespace-pre-wrap text-lg">
                  {c.text.trim() ? `“${c.text}”` : <span className="text-ink-faint">(자막 없음)</span>}
                </p>
                <label
                  htmlFor={checkId}
                  className="mt-3 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-1 text-lg font-semibold"
                >
                  <input
                    id={checkId}
                    type="checkbox"
                    className="h-7 w-7 shrink-0 accent-[#5f7b66]"
                    checked={on}
                    disabled={disabled || loading}
                    aria-label={`이 부분을 쓸게요, ${order}`}
                    aria-describedby={textId}
                    onChange={(e) => toggle(c.id, e.target.checked)}
                  />
                  이 부분을 쓸게요
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <div className="card space-y-4">
        <p role="status" aria-live="polite" className="text-lg font-semibold">
          {sum.message}
        </p>
        <button
          type="button"
          className="btn-primary min-h-14 w-full text-lg"
          disabled={disabled || loading || !sum.canSynthesize}
          aria-busy={loading}
          onClick={() => {
            setRejectedUrl(null);
            onPreview(pickedIds);
          }}
        >
          {loading ? "목소리를 만들고 있어요…" : "이 목소리로 들어 보기"}
        </button>

        {previewStatus === "error" && (
          <p role="alert" className="text-sm text-alert">
            {previewError || "목소리를 만들지 못했어요. 잠시 뒤에 다시 해 주세요."}
          </p>
        )}

        {changed && (
          <p role="status" className="rounded-2xl bg-accent-soft px-4 py-3 text-accent-strong">
            고른 부분이 바뀌었어요. 다시 들어 보세요.
          </p>
        )}

        {canApprove && previewAudioUrl && (
          <div className="space-y-3 border-t border-line pt-4">
            <PreviewPlayer key={previewAudioUrl} url={previewAudioUrl} />
            <p className="text-ink-soft">들어 보시고, 그분 목소리와 비슷한가요?</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="btn min-h-14 bg-sage text-lg text-white hover:opacity-90"
                disabled={disabled}
                onClick={() => onApprove([...(previewIds ?? [])])}
              >
                그분 같아요
              </button>
              <button type="button" className="btn-ghost min-h-14 text-lg" disabled={disabled} onClick={() => {
                  setRejectedUrl(previewAudioUrl ?? null);
                  onReject();
                }}
              >
                다시 고를게요
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ClipPlayButton({ clip, order, describedBy }: { clip: VoiceRefClip; order: string; describedBy: string }) {
  const ready = clip.audio_status === "ready" && !!clip.audio_url;
  const { playing, failed, toggle } = useAudioToggle(ready ? clip.audio_url : null);
  if (!ready) return <span className="text-sm text-ink-faint">재생할 녹음이 없어요</span>;
  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={`${playing ? "멈추기" : "듣기"}, ${order}`}
        aria-describedby={describedBy}
        className={`inline-flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold transition-colors ${
          playing ? "bg-accent text-white" : "bg-accent-soft text-accent-strong hover:bg-[#ecd6c7]"
        }`}
      >
        <span aria-hidden>{playing ? "❚❚" : "▶"}</span>
        <span>{playing ? "멈추기" : "듣기"}</span>
      </button>
      {failed && <span className="text-xs text-alert">재생하지 못했어요.</span>}
    </span>
  );
}

function PreviewPlayer({ url }: { url: string }) {
  const { playing, failed, toggle } = useAudioToggle(url);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "AI 합성 음성 멈추기" : "AI 합성 음성 듣기"}
        className={`inline-flex min-h-14 items-center gap-2 rounded-full border-2 px-6 text-lg font-semibold transition-colors ${
          playing ? "border-ink bg-ink text-paper" : "border-ink/40 bg-paper text-ink hover:border-ink"
        }`}
      >
        <span aria-hidden>{playing ? "❚❚" : "♪"}</span>
        <span>{playing ? "멈추기" : "합성 음성 듣기"}</span>
      </button>
      <span className="rounded-full border border-ink/40 px-2 py-0.5 text-xs font-semibold text-ink">AI 합성 음성</span>
      {failed && (
        <span role="alert" className="w-full text-xs text-alert">
          재생하지 못했어요. 잠시 뒤에 다시 눌러 주세요.
        </span>
      )}
    </div>
  );
}
