import { defineConfig, devices } from "@playwright/test";

// scripts/e2e.sh가 API(8100)와 웹(3100)을 띄운 뒤 실행한다.
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    permissions: ["microphone", "clipboard-read", "clipboard-write"],
    launchOptions: {
      // 가짜 마이크(삐 소리)로 녹음 흐름을 시험한다
      args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
    },
  },
  projects: [{ name: "mobile-chrome", use: { ...devices["Pixel 7"] } }],
});
