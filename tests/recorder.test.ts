import { describe, expect, it } from "vitest";
import { extensionFor, formatClock, pickMimeType } from "../src/lib/recorder";

describe("recorder helpers", () => {
  it("prefers webm/opus, falls back to mp4 for Safari", () => {
    expect(pickMimeType(() => true)).toBe("audio/webm;codecs=opus");
    expect(pickMimeType((t) => t === "audio/mp4")).toBe("audio/mp4");
    expect(pickMimeType(() => false)).toBeUndefined();
  });
  it("maps mime to file extension", () => {
    expect(extensionFor("audio/mp4")).toBe("m4a");
    expect(extensionFor("audio/webm;codecs=opus")).toBe("webm");
  });
  it("formats a clock", () => {
    expect(formatClock(65)).toBe("1:05");
  });
});
