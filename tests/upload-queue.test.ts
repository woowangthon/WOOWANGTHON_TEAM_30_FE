import { describe, expect, it } from "vitest";
import { nextToStart, precheck, type QueueItem } from "../src/lib/upload-queue";

const allowed = ["m4a", "mp3", "mp4", "jpg"];

describe("precheck", () => {
  it("accepts allowed files", () => {
    expect(precheck("통화 녹음.M4A", 1000, allowed, 25)).toBeNull();
  });
  it("rejects unknown types and big files in Korean", () => {
    expect(precheck("메모.txt", 10, allowed, 25)).toContain("형식");
    expect(precheck("big.mp4", 26 * 1024 * 1024, allowed, 25)).toContain("25MB");
    expect(precheck("empty.mp3", 0, allowed, 25)).toContain("빈 파일");
  });
});

describe("nextToStart", () => {
  const item = (key: string, status: QueueItem["status"]): QueueItem => ({ key, name: key, size: 1, status, progress: 0 });
  it("keeps at most two uploads running", () => {
    expect(nextToStart([item("a", "uploading"), item("b", "waiting"), item("c", "waiting")]).map((i) => i.key)).toEqual(["b"]);
    expect(nextToStart([item("a", "waiting"), item("b", "waiting"), item("c", "waiting")]).map((i) => i.key)).toEqual(["a", "b"]);
    expect(nextToStart([item("a", "uploading"), item("b", "uploading"), item("c", "waiting")])).toEqual([]);
  });
});
