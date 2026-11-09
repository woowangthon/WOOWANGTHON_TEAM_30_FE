import { expect, test } from "@playwright/test";
import { signupAndCreateSpace, uploadFixture } from "./helpers";

test("가입 → 공간 만들기 → 업로드 → 목소리 확인 → 대화", async ({ page }) => {
  await signupAndCreateSpace(page);
  await uploadFixture(page);

  await page.getByRole("link", { name: /목소리 확인하러 가기/ }).click();
  await expect(page.getByText("이 목소리가 누구예요?").first()).toBeVisible();
  // 목소리 1 = 자녀, 목소리 2 = 엄마
  await page.getByRole("group", { name: "목소리 2는 누구인가요" }).getByRole("button", { name: "엄마예요" }).click();
  await page.getByRole("group", { name: "목소리 1는 누구인가요" }).getByRole("button", { name: "다른 사람이에요" }).click();
  await expect(page.getByText("모두 확인했어요")).toBeVisible();

  await page.getByRole("link", { name: "말 걸러 가기" }).click();
  await page.getByLabel("엄마에게 말을 걸어 보세요").fill("오늘 밥도 못 먹었어");
  await page.getByRole("button", { name: "말 걸기" }).click();
  const card = page.getByRole("article").first();
  await expect(card).toContainText("밥 꼭 챙겨 먹어라");
  await expect(card).toContainText("2024년 3월 15일");
  // 다른 사람(자녀)의 말은 나오지 않는다
  await expect(page.getByText("나 오늘 면접 보고 왔어")).toHaveCount(0);

  // 원본 클립 재생 경로(서명 URL)가 열린다
  const spaceId = page.url().split("/spaces/")[1].split("/")[0];
  const media = await page.evaluate(async (id) => {
    const r = await fetch(`/api/spaces/${id}/chat`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-yeoun-request": "1" },
      body: JSON.stringify({ message: "밥은 먹었어?" }),
    });
    const body = await r.json();
    const a = await fetch(body.clips[0].audio_url);
    return { status: a.status, type: a.headers.get("content-type") };
  }, spaceId);
  expect(media).toEqual({ status: 200, type: "audio/mpeg" });

  // 위기 신호에는 도움 안내가 먼저
  await page.getByLabel("엄마에게 할 말").fill("엄마 따라가고 싶어");
  await page.getByRole("button", { name: "보내기" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "109" })).toBeVisible();
});
