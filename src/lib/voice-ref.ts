// 그분 목소리 합성에 쓸 '참조 구간'을 고르는 계산 로직. 화면과 분리돼 있다.
// BE voice/ref.py 와 같은 기준을 쓴다.
//
// 참조 클립 기준: 자막이 있는 것을 우선하고, 길이 3~15초인 것을 우선하며,
// 합계 10~15초를 목표로 고른다. 합계가 3초 미만이면 합성 불가다.

/** 합성 가능한 최소 합계(초). */
export const REF_MIN_SEC = 3;
/** 목표 합계 하한(초). 이 값에 닿으면 그만 고른다. */
export const REF_TARGET_MIN_SEC = 10;
/** 목표 합계 상한(초). 더하면 넘는 클립은 건너뛴다. */
export const REF_TARGET_MAX_SEC = 15;
/** 클립 하나의 선호 길이(초). */
export const REF_CLIP_PREFER_MIN_SEC = 3;
export const REF_CLIP_PREFER_MAX_SEC = 15;

/** 기존 Clip 타입(api-types.gen.ts)과 필드 이름을 맞춘 최소 모양. Clip 을 그대로 넘겨도 된다. */
export interface VoiceRefClip {
  id: string;
  start_sec: number;
  end_sec: number;
  /** 자막 */
  text: string;
  audio_url?: string | null;
  audio_status?: "ready" | "placeholder" | "missing" | string;
}

export interface RefSelection {
  /** 고른 클립(입력 순서 또는 우선순위 순서) */
  clips: VoiceRefClip[];
  /** 합계 길이(초) */
  totalSec: number;
  /** 합계가 3초 이상이어서 합성할 수 있는지 */
  canSynthesize: boolean;
}

export interface RefSummary extends RefSelection {
  /** 화면에 보여 줄 안내 문구 */
  message: string;
}

export function clipDurationSec(c: Pick<VoiceRefClip, "start_sec" | "end_sec">): number {
  const d = c.end_sec - c.start_sec;
  return Number.isFinite(d) && d > 0 ? d : 0;
}

function hasSubtitle(c: VoiceRefClip): boolean {
  return (c.text ?? "").trim().length > 0;
}

function inPreferredLength(c: VoiceRefClip): boolean {
  const d = clipDurationSec(c);
  return d >= REF_CLIP_PREFER_MIN_SEC && d <= REF_CLIP_PREFER_MAX_SEC;
}

export function totalDurationSec(clips: readonly VoiceRefClip[]): number {
  return clips.reduce((sum, c) => sum + clipDurationSec(c), 0);
}

/** 합계(초)에 맞는 안내 문구. 문구 속 초는 소수점을 버린 정수다. */
export function refMessage(totalSec: number): string {
  const n = Math.floor(totalSec);
  if (totalSec < REF_MIN_SEC) return `조금 더 골라 주세요 (지금 ${n}초)`;
  if (totalSec < REF_TARGET_MIN_SEC) return `지금 ${n}초 · 10~15초면 충분해요`;
  return `충분해요 (지금 ${n}초)`;
}

/** 가족이 직접 고른 클립들의 합계·합성 가능 여부·문구. */
export function summarizeRefClips(clips: readonly VoiceRefClip[]): RefSummary {
  const totalSec = totalDurationSec(clips);
  return {
    clips: [...clips],
    totalSec,
    canSynthesize: totalSec >= REF_MIN_SEC,
    message: refMessage(totalSec),
  };
}

/** 두 id 목록이 순서와 상관없이 같은 집합인지. 미리 들은 구간과 현재 선택이 같은지 볼 때 쓴다. */
export function sameIdSet(a: readonly string[], b: readonly string[]): boolean {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const id of sa) if (!sb.has(id)) return false;
  return true;
}

export interface ApproveCheck {
  /** 미리 듣기 상태 */
  status: "idle" | "loading" | "ready" | "error";
  /** 미리 듣기 음성 주소 */
  audioUrl?: string | null;
  /** 그 음성을 만든 참조 클립 id(부모가 음성과 함께 넘긴다) */
  previewIds?: readonly string[] | null;
  /** 지금 고른 클립 id */
  selectedIds: readonly string[];
  /** 가족이 '다시 고를게요'로 거절한 음성 주소 */
  rejectedUrl?: string | null;
}

/**
 * '그분 같아요' 승인 UI 를 보여 줘도 되는지. 아래를 모두 만족할 때만 true.
 * ready 상태, 음성 주소 있음, 거절한 주소가 아님, previewIds 가 비어 있지 않고 현재 선택과 같은 집합.
 */
export function canApprovePreview(c: ApproveCheck): boolean {
  if (c.status !== "ready" || !c.audioUrl) return false;
  if (c.rejectedUrl && c.rejectedUrl === c.audioUrl) return false;
  if (!c.previewIds || c.previewIds.length === 0) return false;
  if (c.selectedIds.length === 0) return false;
  return sameIdSet(c.previewIds, c.selectedIds);
}

/** 선택된 id 에 해당하는 클립을 후보 목록 순서대로 돌려준다. */
export function pickByIds(candidates: readonly VoiceRefClip[], ids: readonly string[]): VoiceRefClip[] {
  const set = new Set(ids);
  return candidates.filter((c) => set.has(c.id));
}

/**
 * 추천 고르기(결정적 알고리즘).
 * ① 길이가 0 이하인 후보는 뺀다.
 * ② (우선 후보 → 자막 있음 → 길이 3~15초) 순으로 안정 정렬한다. 같은 순위끼리는 입력 순서를 지킨다.
 * ③ 앞에서부터 더하되, 더해서 합계가 15초를 넘으면 건너뛴다(아직 아무것도 못 골랐다면 그 하나는 고른다).
 * ④ 합계가 10초 이상이 되면 멈춘다.
 * ⑤ 고른 목록·합계·합성 가능 여부를 돌려준다.
 *
 * @param preferredIds BE 가 source_ids 로 준 우선 후보 id. 없으면 생략한다.
 */
export function suggestRefClips(candidates: readonly VoiceRefClip[], preferredIds?: readonly string[]): RefSelection {
  const preferred = new Set(preferredIds ?? []);
  const ranked = candidates
    .filter((c) => clipDurationSec(c) > 0)
    .map((c, index) => ({
      c,
      index,
      rank: [preferred.has(c.id) ? 0 : 1, hasSubtitle(c) ? 0 : 1, inPreferredLength(c) ? 0 : 1],
    }))
    .sort((a, b) => {
      for (let i = 0; i < a.rank.length; i++) {
        if (a.rank[i] !== b.rank[i]) return a.rank[i] - b.rank[i];
      }
      return a.index - b.index; // 안정 정렬 보장
    });

  const picked: VoiceRefClip[] = [];
  let total = 0;
  for (const { c } of ranked) {
    const d = clipDurationSec(c);
    if (picked.length > 0 && total + d > REF_TARGET_MAX_SEC) continue;
    picked.push(c);
    total += d;
    if (total >= REF_TARGET_MIN_SEC) break;
  }
  return { clips: picked, totalSec: total, canSynthesize: total >= REF_MIN_SEC };
}
