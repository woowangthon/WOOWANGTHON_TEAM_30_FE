import { describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, isSleepingResponse, onWakeChange, type ClientDeps } from "../src/lib/api";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
function htmlResponse(status: number) {
  return new Response("<html>Service waking up</html>", { status, headers: { "content-type": "text/html" } });
}

function deps(responses: Array<Response | Error>): ClientDeps & { calls: number; clock: number } {
  const state = { calls: 0, clock: 0 };
  return Object.assign(state, {
    fetch: vi.fn(async () => {
      const r = responses[Math.min(state.calls, responses.length - 1)];
      state.calls++;
      if (r instanceof Error) throw r;
      return r.clone();
    }) as unknown as typeof fetch,
    sleep: async (ms: number) => {
      state.clock += ms;
    },
    now: () => state.clock,
  });
}

describe("isSleepingResponse", () => {
  it("treats HTML and non-JSON as sleeping", () => {
    expect(isSleepingResponse(200, "text/html; charset=utf-8")).toBe(true);
    expect(isSleepingResponse(502, null)).toBe(true);
    expect(isSleepingResponse(503, "application/json")).toBe(false);
    expect(isSleepingResponse(204, null)).toBe(false);
    expect(isSleepingResponse(404, "application/json")).toBe(false);
  });
});

describe("apiRequest", () => {
  it("returns JSON on success", async () => {
    const d = deps([jsonResponse(200, { ok: true })]);
    await expect(apiRequest("/health", {}, d)).resolves.toEqual({ ok: true });
  });

  it("retries while the server is waking and announces it", async () => {
    const events: boolean[] = [];
    const off = onWakeChange((w) => events.push(w));
    const d = deps([new TypeError("fetch failed"), htmlResponse(200), htmlResponse(502), jsonResponse(200, { ok: 1 })]);
    await expect(apiRequest("/health", {}, d)).resolves.toEqual({ ok: 1 });
    expect(d.calls).toBe(4);
    expect(events).toEqual([true, false]);
    off();
  });

  it("gives up after two minutes with a Korean message", async () => {
    const d = deps([htmlResponse(502)]);
    const err = (await apiRequest("/health", {}, d).catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("server_waking");
    expect(err.messageKo).toContain("서버");
    expect(d.clock).toBeGreaterThanOrEqual(120_000);
  });

  it("surfaces API error envelopes", async () => {
    const d = deps([jsonResponse(404, { error: { code: "not_found", message_ko: "찾을 수 없어요." } })]);
    const err = (await apiRequest("/spaces/x", {}, d).catch((e) => e)) as ApiError;
    expect(err.code).toBe("not_found");
    expect(err.messageKo).toBe("찾을 수 없어요.");
    expect(d.calls).toBe(1);
  });

  it("sends the CSRF header on writes", async () => {
    const d = deps([jsonResponse(200, {})]);
    await apiRequest("/auth/login", { method: "POST", json: { a: 1 } }, d);
    const init = (d.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(init.headers["x-yeoun-request"]).toBe("1");
  });
});
