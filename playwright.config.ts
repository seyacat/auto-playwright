import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 90000,
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
  use: {
    headless: true,
    baseURL: "http://127.0.0.1:3000",
    ignoreHTTPSErrors: true,
  },
});
