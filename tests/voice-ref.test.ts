import { describe, expect, it } from "vitest";
import {
  clipDurationSec,
  canApprovePreview,
  pickByIds,
  sameIdSet,
  refMessage,
  suggestRefClips,
  summarizeRefClips,
  totalDurationSec,
  type VoiceRefClip,
} from "@/lib/voice-ref";

const clip = (id: string, dur: number, text = "자막"): VoiceRefClip => ({ id, start_sec: 10, end_sec: 10 + dur, text });
const ids = (r: { clips: VoiceRefClip[] }) => r.clips.map((c) => c.id);

describe("합계와 합성 가능 여부", () => {
  it("길이를 더한다", () => {
    expect(totalDurationSec([clip("a", 2), clip("b", 4.5)])).toBeCloseTo(6.5);
  });
  it("길이가 0 이하이면 0으로 센다", () => {
    expect(clipDurationSec({ start_sec: 5, end_sec: 5 })).toBe(0);
    expect(clipDurationSec({ start_sec: 8, end_sec: 5 })).toBe(0);
  });
  it("3초 미만이면 합성 불가", () => {
    expect(summarizeRefClips([clip("a", 2.9)]).canSynthesize).toBe(false);
    expect(summarizeRefClips([]).canSynthesize).toBe(false);
  });
  it("정확히 3초면 합성 가능", () => {
    expect(summarizeRefClips([clip("a", 3)]).canSynthesize).toBe(true);
  });
  it("id 로 고른다(후보 순서 유지)", () => {
    const all = [clip("a", 1), clip("b", 1), clip("c", 1)];
    expect(pickByIds(all, ["c", "a"]).map((c) => c.id)).toEqual(["a", "c"]);
  });
});

describe("안내 문구", () => {
  it("3초 미만", () => {
    expect(refMessage(2)).toBe("조금 더 골라 주세요 (지금 2초)");
    expect(refMessage(0)).toBe("조금 더 골라 주세요 (지금 0초)");
    expect(refMessage(2.99)).toBe("조금 더 골라 주세요 (지금 2초)");
  });
  it("경계 3초는 두 번째 문구", () => {
    expect(refMessage(3)).toBe("지금 3초 · 10~15초면 충분해요");
  });
  it("3~10초", () => {
    expect(refMessage(8)).toBe("지금 8초 · 10~15초면 충분해요");
    expect(refMessage(9.99)).toBe("지금 9초 · 10~15초면 충분해요");
  });
  it("경계 10초는 세 번째 문구", () => {
    expect(refMessage(10)).toBe("충분해요 (지금 10초)");
  });
  it("10초 이상, 초는 소수점을 버린다", () => {
    expect(refMessage(12.9)).toBe("충분해요 (지금 12초)");
  });
  it("summarizeRefClips 가 문구를 함께 준다", () => {
    expect(summarizeRefClips([clip("a", 4), clip("b", 4)]).message).toBe("지금 8초 · 10~15초면 충분해요");
  });
});

describe("추천 고르기", () => {
  it("길이 0 이하 후보는 뺀다", () => {
    const r = suggestRefClips([clip("zero", 0), clip("neg", -2), clip("ok", 5)]);
    expect(ids(r)).toEqual(["ok"]);
  });
  it("합계 10초 이상이 되면 멈춘다", () => {
    const r = suggestRefClips([clip("a", 5), clip("b", 5), clip("c", 5)]);
    expect(ids(r)).toEqual(["a", "b"]);
    expect(r.totalSec).toBe(10);
    expect(r.canSynthesize).toBe(true);
  });
  it("더해서 15초를 넘는 후보는 건너뛴다", () => {
    const r = suggestRefClips([clip("a", 9), clip("b", 8), clip("c", 4)]);
    expect(ids(r)).toEqual(["a", "c"]);
    expect(r.totalSec).toBe(13);
  });
  it("아직 아무것도 고르지 않았다면 15초를 넘어도 하나는 고른다", () => {
    const r = suggestRefClips([clip("long", 20)]);
    expect(ids(r)).toEqual(["long"]);
    expect(r.totalSec).toBe(20);
  });
  it("15초 넘는 긴 클립은 선호 길이가 아니라 뒤로 밀리고, 이미 골랐으면 건너뛴다", () => {
    const r = suggestRefClips([clip("long", 20), clip("b", 4)]);
    expect(ids(r)).toEqual(["b"]);
  });
  it("자막 있는 것을 먼저 고른다", () => {
    const r = suggestRefClips([clip("nosub", 6, ""), clip("sub", 6, "말")]);
    expect(ids(r)).toEqual(["sub", "nosub"]);
  });
  it("공백뿐인 자막은 없는 것으로 본다", () => {
    const r = suggestRefClips([clip("blank", 6, "   "), clip("sub", 6)]);
    expect(ids(r)[0]).toBe("sub");
  });
  it("길이 3~15초를 먼저 고른다", () => {
    const r = suggestRefClips([clip("short", 2), clip("good", 6)]);
    expect(ids(r)[0]).toBe("good");
  });
  it("우선 후보(preferredIds)가 가장 앞선다", () => {
    const r = suggestRefClips([clip("a", 6), clip("b", 6, ""), clip("c", 6)], ["b"]);
    expect(ids(r)[0]).toBe("b");
  });
  it("같은 순위끼리는 입력 순서를 지킨다", () => {
    const r = suggestRefClips([clip("a", 3), clip("b", 3), clip("c", 3), clip("d", 3), clip("e", 3)]);
    expect(ids(r)).toEqual(["a", "b", "c", "d"]);
  });
  it("같은 입력이면 같은 결과(결정적)", () => {
    const input = [clip("a", 2), clip("b", 7, ""), clip("c", 4), clip("d", 12)];
    expect(ids(suggestRefClips(input, ["c"]))).toEqual(ids(suggestRefClips(input, ["c"])));
  });
  it("합계가 3초 미만이면 합성 불가", () => {
    const r = suggestRefClips([clip("a", 1), clip("b", 1.5)]);
    expect(r.totalSec).toBe(2.5);
    expect(r.canSynthesize).toBe(false);
  });
  it("후보가 없으면 빈 목록, 합성 불가", () => {
    const r = suggestRefClips([]);
    expect(r).toEqual({ clips: [], totalSec: 0, canSynthesize: false });
  });
});

describe("미리 들은 구간과 현재 선택 비교", () => {
  it("순서가 달라도 같은 집합이면 같다", () => {
    expect(sameIdSet(["a", "b"], ["b", "a"])).toBe(true);
    expect(sameIdSet([], [])).toBe(true);
  });
  it("하나 빠지면 다르다(A·B 미리 듣기 뒤 B 해제)", () => {
    expect(sameIdSet(["a", "b"], ["a"])).toBe(false);
  });
  it("하나 늘어도 다르다", () => {
    expect(sameIdSet(["a"], ["a", "b"])).toBe(false);
  });
  it("개수가 같아도 내용이 다르면 다르다", () => {
    expect(sameIdSet(["a", "b"], ["a", "c"])).toBe(false);
  });
  it("중복 id 는 한 번으로 센다", () => {
    expect(sameIdSet(["a", "a"], ["a"])).toBe(true);
  });
});

describe("승인 UI 를 보여 줘도 되는지", () => {
  const ok = { status: "ready" as const, audioUrl: "data:audio/wav;base64,AAA", previewIds: ["a", "b"], selectedIds: ["a", "b"] };
  it("음성·previewIds·선택이 맞으면 가능", () => {
    expect(canApprovePreview(ok)).toBe(true);
    expect(canApprovePreview({ ...ok, selectedIds: ["b", "a"] })).toBe(true);
  });
  it("빈 선택 + ready 는 불가", () => {
    expect(canApprovePreview({ ...ok, selectedIds: [] })).toBe(false);
    expect(canApprovePreview({ ...ok, previewIds: [], selectedIds: [] })).toBe(false);
  });
  it("새 마운트 + 옛 음성 + 다른 선택은 불가", () => {
    expect(canApprovePreview({ ...ok, selectedIds: ["c"] })).toBe(false);
  });
  it("거절한 뒤 같은 음성은 불가, 다른 음성은 가능", () => {
    expect(canApprovePreview({ ...ok, rejectedUrl: ok.audioUrl })).toBe(false);
    expect(canApprovePreview({ ...ok, rejectedUrl: "data:audio/wav;base64,OLD" })).toBe(true);
  });
  it("거절 뒤 선택을 바꿔도 같은 음성이면 불가", () => {
    expect(canApprovePreview({ ...ok, rejectedUrl: ok.audioUrl, selectedIds: ["a"], previewIds: ["a"] })).toBe(false);
  });
  it("previewIds 가 null/없음/빈 목록이면 불가", () => {
    expect(canApprovePreview({ ...ok, previewIds: null })).toBe(false);
    expect(canApprovePreview({ ...ok, previewIds: undefined })).toBe(false);
    expect(canApprovePreview({ ...ok, previewIds: [] })).toBe(false);
  });
  it("선택을 바꿨다가 되돌리면 다시 가능", () => {
    expect(canApprovePreview({ ...ok, selectedIds: ["a"] })).toBe(false);
    expect(canApprovePreview({ ...ok, selectedIds: ["a", "b"] })).toBe(true);
  });
  it("로딩·idle·error·음성 없음은 불가", () => {
    expect(canApprovePreview({ ...ok, status: "loading" })).toBe(false);
    expect(canApprovePreview({ ...ok, status: "idle" })).toBe(false);
    expect(canApprovePreview({ ...ok, status: "error" })).toBe(false);
    expect(canApprovePreview({ ...ok, audioUrl: null })).toBe(false);
    expect(canApprovePreview({ ...ok, audioUrl: "" })).toBe(false);
  });
});
