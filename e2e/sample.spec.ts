import { expect, test } from "@playwright/test";

test("가입 없이 샘플 공간과 대화한다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "가입 없이 샘플 공간 체험하기" }).click();
  await expect(page.getByRole("heading", { name: "[샘플] 김순자 할머니" })).toBeVisible();
  await expect(page.getByText("가상 인물로 만든 샘플 공간이에요")).toBeVisible();

  await page.getByLabel("김순자에게 말을 걸어 보세요").fill("할머니 김치찌개 어떻게 끓였어?");
  await page.getByRole("button", { name: "말 걸기" }).click();
  const card = page.getByRole("article").first();
  await expect(card).toContainText("김치찌개는 신 김치를");
  await expect(card).toContainText("샘플 녹음 준비 중");
  await expect(page.getByRole("note").filter({ hasText: "여운 안내" }).first()).toBeVisible();

  // 맞는 녹음이 없으면 솔직하게
  await page.getByLabel("김순자에게 할 말").fill("비트코인 사도 될까?");
  await page.getByRole("button", { name: "보내기" }).click();
  await expect(page.getByText("딱 맞는 녹음은 없어요")).toBeVisible();

  // 타임라인
  await page.getByRole("link", { name: "타임라인" }).click();
  await expect(page.getByRole("heading", { name: /년 전 오늘|예전 오늘/ })).toBeVisible();
});
