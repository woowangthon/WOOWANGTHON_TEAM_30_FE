import { expect, type Page } from "@playwright/test";
import path from "node:path";

export const FIXTURE = path.resolve(__dirname, "../../fixtures/upload/통화 녹음 엄마_240315_190000.m4a");

export async function signupAndCreateSpace(page: Page, spaceName = "엄마") {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("부르는 이름").fill("지은");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호 (8자 이상)").fill("password123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page).toHaveURL(/\/spaces$/);
  await page.getByRole("button", { name: "+ 새 추억 공간 만들기" }).click();
  await page.getByLabel("공간 이름").fill(spaceName);
  await page.getByRole("button", { name: "어머니" }).click();
  await page.getByRole("button", { name: "만들기", exact: true }).click();
  await expect(page).toHaveURL(/\/upload$/);
  return email;
}

export async function uploadFixture(page: Page) {
  await page.getByText("이 자료를 올릴 권리가 있고").click();
  await page.locator("#file-input").setInputFiles(FIXTURE);
  await expect(page.getByText("준비 완료")).toBeVisible({ timeout: 60_000 });
}
