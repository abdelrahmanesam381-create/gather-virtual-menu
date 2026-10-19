import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  globalSetup: "./tests/browser/setup.ts",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
  },
  reporter: "list",
});
