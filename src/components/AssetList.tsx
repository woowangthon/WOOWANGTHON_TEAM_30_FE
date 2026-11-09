"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Asset, AssetList as AssetListT } from "@/lib/api-types.gen";
import { formatBytes, formatDateKo, formatDuration } from "@/lib/format";
import { usePolling } from "@/lib/hooks";

export const STAGE_LABELS: Record<string, string> = {
  normalize: "소리 정리",
  stt: "받아쓰기",
  diarize: "목소리 나누기",
  segment: "문장 클립 만들기",
  tag: "주제 붙이기",
  index: "찾기 준비",
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "올림",
  queued: "차례를 기다리는 중",
  processing: "정리하는 중",
  ready: "준비 완료",
  failed: "실패",
};

const ORIGINS: Record<string, string> = {
  call: "통화 녹음",
  video: "동영상",
  voice_message: "음성 메시지",
  ahead: "미리 남기기",
  other: "기타",
};

function StageDots({ asset }: { asset: Asset }) {
  return (
    <ol className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm" aria-label="처리 단계">
      {asset.stages.map((s) => {
        const label = asset.kind === "photo" ? "사진 정리" : STAGE_LABELS[s.name];
        const color =
          s.state === "done"
            ? "text-sage"
            : s.state === "running"
              ? "text-accent-strong font-semibold"
              : s.state === "failed"
                ? "text-alert font-semibold"
                : s.state === "skipped"
                  ? "text-ink-faint line-through"
                  : "text-ink-faint";
        const mark = s.state === "done" ? "✓" : s.state === "running" ? "●" : s.state === "failed" ? "✕" : "○";
        return (
          <li key={s.name} className={color} title={s.note || undefined}>
            {mark} {label}
          </li>
        );
      })}
    </ol>
  );
}

function AssetRow({ asset, spaceId, editable, onChange }: { asset: Asset; spaceId: string; editable: boolean; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const notes = asset.stages.filter((s) => s.note).map((s) => s.note as string);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr("");
    try {
      await fn();
      onChange();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="card">
      <div className="flex items-start gap-3">
        {asset.thumb_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.thumb_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-paper text-2xl" aria-hidden>
            {asset.kind === "video" ? "🎞" : asset.kind === "photo" ? "🖼" : "🎙"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold" title={asset.filename}>{asset.filename}</p>
          <p className="text-sm text-ink-soft">
            {ORIGINS[asset.origin]} · {formatDateKo(asset.recorded_at)} · {formatBytes(asset.size_bytes)}
            {asset.duration_sec ? ` · ${formatDuration(asset.duration_sec)}` : ""}
            {asset.status === "ready" && asset.kind !== "photo" ? ` · 클립 ${asset.clip_count}개` : ""}
          </p>
          <p className={`mt-1 text-sm font-semibold ${asset.status === "failed" ? "text-alert" : asset.status === "ready" ? "text-sage" : "text-accent-strong"}`}>
            {STATUS_LABELS[asset.status]}
            {asset.status === "processing" && ` (${Math.round(asset.progress * 100)}%)`}
          </p>
        </div>
      </div>
      {asset.status !== "ready" && <StageDots asset={asset} />}
      {asset.error && <p className="mt-2 text-sm text-alert">{asset.error.message_ko}</p>}
      {notes.length > 0 && asset.status === "ready" && (
        <ul className="mt-2 space-y-1 text-sm text-guide">
          {notes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
      )}
      {err && <p className="mt-2 text-sm text-alert">{err}</p>}
      {editable && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(asset.date_source === "upload" || asset.date_source === "unknown" || asset.date_source === "user") && (
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              {asset.date_source === "user" ? "날짜" : "날짜를 알면 적어 주세요"}
              <input
                type="date"
                className="rounded-xl border border-line px-2 py-1"
                defaultValue={asset.recorded_at || ""}
                onChange={(e) =>
                  act(() => api.patch(`/spaces/${spaceId}/assets/${asset.id}`, { recorded_at: e.target.value || null }))
                }
              />
            </label>
          )}
          {asset.status === "failed" && (
            <button className="btn-soft min-h-10" disabled={busy} onClick={() => act(() => api.post(`/spaces/${spaceId}/assets/${asset.id}/retry`))}>
              다시 처리하기
            </button>
          )}
          <button
            className="ml-auto min-h-10 rounded-xl px-3 text-sm text-ink-faint hover:text-alert"
            disabled={busy}
            onClick={() => {
              if (confirm("이 자료와 여기서 만든 클립·자막을 모두 지울까요? 되돌릴 수 없어요.")) {
                void act(() => api.del(`/spaces/${spaceId}/assets/${asset.id}`));
              }
            }}
          >
            지우기
          </button>
        </div>
      )}
    </li>
  );
}

export function AssetList({
  spaceId,
  editable,
  list,
  reload,
}: {
  spaceId: string;
  editable: boolean;
  list: AssetListT | undefined;
  reload: () => void;
}) {
  const busy = list?.assets.some((a) => ["uploaded", "queued", "processing"].includes(a.status)) ?? false;
  usePolling(reload, 2500, busy);
  if (!list || list.assets.length === 0) return null;
  return (
    <section aria-labelledby="assets-title" className="space-y-3">
      <h2 id="assets-title" className="font-semibold">올린 자료 ({list.assets.length})</h2>
      {busy && <p className="text-sm text-ink-soft">정리하는 동안 이 화면을 떠나도 괜찮아요. 끝나면 목소리 확인에서 이어 할 수 있어요.</p>}
      <ul className="space-y-3">
        {list.assets.map((a) => (
          <AssetRow key={a.id} asset={a} spaceId={spaceId} editable={editable} onChange={reload} />
        ))}
      </ul>
    </section>
  );
}
