/**
 * web 서버가 시작될 때 API 서버도 함께 깨운다 (Render 무료 등급은 둘 다 잠든다).
 * 실패해도 web 시작을 막지 않는다.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const origin = (process.env.YEOUN_API_ORIGIN || "http://localhost:8000").replace(/\/+$/, "");
  const deadline = Date.now() + 120_000;
  const ping = async () => {
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${origin}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
        if ((res.headers.get("content-type") || "").includes("application/json")) {
          console.log("[yeoun] api awake");
          return;
        }
      } catch {
        /* 깨는 중 */
      }
      await new Promise((r) => setTimeout(r, 5_000));
    }
    console.log("[yeoun] api did not answer within 2 minutes");
  };
  void ping();
}
