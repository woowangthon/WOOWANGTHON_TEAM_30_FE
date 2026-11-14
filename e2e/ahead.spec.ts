import { expect, test } from "@playwright/test";
import { signupAndCreateSpace } from "./helpers";

test("미리 남기기 링크로 녹음한다 (가짜 마이크)", async ({ page, browser }) => {
  await signupAndCreateSpace(page, "아빠");
  await page.getByRole("link", { name: "미리 남기기" }).click();
  await page.getByText("어릴 때 살던 동네는 어떤 곳이었어요?").click();
  await page.getByRole("button", { name: "녹음 링크 만들기" }).click();
  await expect(page.getByText("링크를 만들었어요")).toBeVisible();
  const url = await page.getByLabel("녹음 링크").inputValue();
  expect(url).toContain("/r/");

  // 녹음하는 분: 로그인 없이 새 브라우저에서
  const ctx = await browser.newContext({ permissions: ["microphone"] });
  const rec = await ctx.newPage();
  await rec.goto(url.replace(/^https?:\/\/[^/]+/, process.env.E2E_BASE_URL || "http://localhost:3100"));
  await expect(rec.getByText("녹음하기 전에 읽어 주세요")).toBeVisible();
  await expect(rec.getByText("새 음성을 만들지 않아요", { exact: false })).toBeVisible();
  await rec.getByRole("button", { name: "네, 이해했어요. 시작할게요" }).click();
  await rec.getByRole("button", { name: "녹음 시작" }).click();
  await rec.waitForTimeout(2500);
  await rec.getByRole("button", { name: "녹음 멈추기" }).click();
  await rec.getByRole("button", { name: "이대로 보내기" }).click();
  await expect(rec.getByText("보냈어요 ✓")).toBeVisible();
  await rec.getByRole("button", { name: "다 했어요 (마치기)" }).click();
  await expect(rec.getByText("고맙습니다")).toBeVisible();

  // 1회용: 다시 열면 쓸 수 없다
  await rec.reload();
  await expect(rec.getByText("링크를 열 수 없어요")).toBeVisible();
  await ctx.close();

  await page.reload();
  await expect(page.getByText("1/1개 답함")).toBeVisible();
});
