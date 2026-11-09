"use client";

import Link from "next/link";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import type { Clip, ClipList, Speaker, SpeakerRole, VoiceReview, VoiceReviewAsset } from "@/lib/api-types.gen";
import { canEdit, useSpace } from "@/lib/space-context";
import { formatDateKo, formatDuration, josa } from "@/lib/format";
import { ClipPlayer } from "@/components/ClipPlayer";
import { Empty, ErrorBox, Notice, Spinner } from "@/components/Feedback";

function RoleButtons({
  speaker,
  personName,
  onPick,
  busy,
}: {
  speaker: Speaker;
  personName: string;
  onPick: (r: SpeakerRole) => void;
  busy: boolean;
}) {
  const opts: { role: SpeakerRole; label: string }[] = [
    { role: "person", label: josa(personName, "이에요", "예요") },
    { role: "other", label: "다른 사람이에요" },
    { role: "unknown", label: "잘 모르겠어요" },
  ];
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label={`${speaker.label}는 누구인가요`}>
      {opts.map((o) => (
        <button
          key={o.role}
          type="button"
          disabled={busy}
          onClick={() => onPick(o.role)}
          aria-pressed={speaker.role === o.role && o.role !== "unknown"}
          className={`btn min-h-12 border ${
            speaker.role === o.role && o.role !== "unknown"
              ? o.role === "person"
                ? "border-sage bg-sage text-white"
                : "border-ink bg-ink text-paper"
              : "border-line bg-card text-ink hover:bg-paper"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ClipEditor({ clip, spaceId, editable, onSaved }: { clip: Clip; spaceId: string; editable: boolean; onSaved: (c: Clip) => void }) {
  const [text, setText] = useState(clip.text);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(patch: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const c = await api.patch<Clip>(`/spaces/${spaceId}/clips/${clip.id}`, patch);
      onSaved(c);
      setEditing(false);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`rounded-2xl border p-3 ${clip.included ? "border-sage/40 bg-sage-soft/50" : "border-line bg-card"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <ClipPlayer url={clip.audio_url} status={clip.audio_status} label={formatDuration(clip.end_sec - clip.start_sec)} />
        <span className={`text-sm font-semibold ${clip.included ? "text-sage" : "text-ink-faint"}`}>
          {clip.included ? "대화에 써요" : "대화에 안 써요"}
        </span>
        {editable && (
          <button
            type="button"
            disabled={busy}
            className="ml-auto min-h-10 rounded-xl px-3 text-sm text-accent-strong underline underline-offset-4"
            onClick={() => save({ include_override: !clip.included })}
          >
            {clip.included ? "빼기" : "넣기"}
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea className="field" rows={3} value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} aria-label="자막 고치기" />
          <div className="flex gap-2">
            <button className="btn-ghost min-h-10" type="button" onClick={() => { setText(clip.text); setEditing(false); }}>취소</button>
            <button className="btn-primary min-h-10" type="button" disabled={busy} onClick={() => save({ text })}>자막 저장</button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap">
          {clip.text ? `“${clip.text}”` : <span className="text-ink-faint">(자막 없음 — 들어 보고 적어 주세요)</span>}
          {clip.text_edited && <span className="ml-2 text-xs text-ink-faint">고친 자막</span>}
        </p>
      )}
      {editable && !editing && (
        <button type="button" className="mt-1 text-sm text-ink-soft underline underline-offset-4" onClick={() => setEditing(true)}>
          자막 고치기
        </button>
      )}
      {err && <p className="mt-1 text-sm text-alert">{err}</p>}
    </li>
  );
}

function AssetReview({ item, personName, spaceId, editable, onChange }: { item: VoiceReviewAsset; personName: string; spaceId: string; editable: boolean; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showClips, setShowClips] = useState(false);
  const clips = useApi<ClipList>(showClips ? `/spaces/${spaceId}/assets/${item.asset.id}/clips` : null);

  async function pick(speaker: Speaker, role: SpeakerRole) {
    setBusy(true);
    setErr("");
    try {
      await api.patch(`/spaces/${spaceId}/speakers/${speaker.id}`, { role });
      onChange();
      if (showClips) void clips.reload();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="card space-y-4">
      <div>
        <p className="font-semibold">{item.asset.filename}</p>
        <p className="text-sm text-ink-soft">
          {formatDateKo(item.asset.recorded_at)} · 클립 {item.asset.clip_count}개 {item.needs_review ? "" : "· 확인 완료"}
        </p>
      </div>
      {!item.diarized && (
        <Notice>
          이 파일은 목소리를 나누지 않았어요. 대부분 {personName}의 목소리라면 &lsquo;{personName}&rsquo;을 고르고, 아래 &lsquo;클립 하나씩 보기&rsquo;에서 다른 사람 부분만 빼 주세요.
        </Notice>
      )}
      {item.speakers.map((s) => (
        <div key={s.id} className="rounded-2xl border border-line p-4">
          <p className="font-semibold">
            {s.label} <span className="font-normal text-ink-soft">· {s.clip_count}개 구간{s.total_sec ? ` · ${formatDuration(s.total_sec)}` : ""}</span>
          </p>
          <ul className="mt-3 space-y-3">
            {s.samples.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <ClipPlayer url={c.audio_url} status={c.audio_status} label="들어 보기" />
                <p className="text-ink-soft">{c.text ? `“${c.text}”` : "(자막 없음)"}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-semibold">이 목소리가 누구예요?</p>
          {editable ? (
            <RoleButtons speaker={s} personName={personName} busy={busy} onPick={(r) => pick(s, r)} />
          ) : (
            <p className="text-ink-soft">{s.role === "person" ? personName : s.role === "other" ? "다른 사람" : "아직 모름"}</p>
          )}
        </div>
      ))}
      {err && <p className="text-sm text-alert">{err}</p>}
      <button type="button" className="btn-ghost w-full" onClick={() => setShowClips((v) => !v)} aria-expanded={showClips}>
        {showClips ? "클립 목록 접기" : "클립 하나씩 보기 (포함·제외, 자막 고치기)"}
      </button>
      {showClips &&
        (clips.loading && !clips.data ? (
          <Spinner />
        ) : (
          <ul className="space-y-2">
            {clips.data?.clips.map((c) => (
              <ClipEditor
                key={c.id}
                clip={c}
                spaceId={spaceId}
                editable={editable}
                onSaved={(nc) => {
                  if (clips.data) clips.setData({ clips: clips.data.clips.map((x) => (x.id === nc.id ? nc : x)) });
                  onChange();
                }}
              />
            ))}
          </ul>
        ))}
    </li>
  );
}

export default function VoicesPage() {
  const { space, reload: reloadSpace } = useSpace();
  const review = useApi<VoiceReview>(`/spaces/${space.id}/voices`);
  const editable = canEdit(space);
  const reload = () => {
    void review.reload();
    void reloadSpace();
  };

  if (review.error) return <ErrorBox message={review.error.messageKo} onRetry={review.reload} />;
  if (!review.data) return <Spinner />;
  const pending = review.data.assets.filter((a) => a.needs_review);
  const done = review.data.assets.filter((a) => !a.needs_review);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold">{space.person_name}의 목소리를 골라 주세요</h2>
        <p className="mt-1 text-ink-soft">
          녹음마다 목소리를 나눠 두었어요. 대표 구간을 들어 보고 누구인지 골라 주시면, {space.person_name}의 목소리만 대화에 써요.
        </p>
      </div>
      {review.data.assets.length === 0 && (
        <Empty title="아직 확인할 녹음이 없어요">
          <Link href={`/spaces/${space.id}/upload`} className="underline underline-offset-4">자료를 먼저 올려 주세요.</Link>
        </Empty>
      )}
      {pending.length > 0 && (
        <ul className="space-y-4">
          {pending.map((a) => (
            <AssetReview key={a.asset.id} item={a} personName={space.person_name} spaceId={space.id} editable={editable} onChange={reload} />
          ))}
        </ul>
      )}
      {pending.length === 0 && done.length > 0 && (
        <Notice tone="sage">
          모두 확인했어요. 이제 {space.person_name}에게 말을 걸어 보세요.{" "}
          <Link href={`/spaces/${space.id}`} className="font-semibold underline underline-offset-4">말 걸러 가기</Link>
        </Notice>
      )}
      {done.length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer font-semibold">확인한 녹음 ({done.length})</summary>
          <ul className="mt-4 space-y-4">
            {done.map((a) => (
              <AssetReview key={a.asset.id} item={a} personName={space.person_name} spaceId={space.id} editable={editable} onChange={reload} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
