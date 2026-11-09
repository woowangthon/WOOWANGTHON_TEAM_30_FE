import { expect, test } from "@playwright/test";
import { signupAndCreateSpace, uploadFixture } from "./helpers";

test("공간을 완전히 지운다", async ({ page }) => {
  await signupAndCreateSpace(page, "할머니");
  await uploadFixture(page);
  const spaceUrl = page.url().replace(/\/upload$/, "");
  const spaceId = spaceUrl.split("/").pop();

  await page.getByRole("link", { name: "설정" }).click();
  await page.getByLabel(/확인을 위해 공간 이름/).fill("할머니");
  await page.getByRole("button", { name: "이 공간을 완전히 지우기" }).click();
  await expect(page).toHaveURL(/\/spaces$/);
  await expect(page.getByText("아직 만든 공간이 없어요")).toBeVisible();

  const status = await page.evaluate(async (id) => (await fetch(`/api/spaces/${id}`)).status, spaceId);
  expect(status).toBe(404);
});
