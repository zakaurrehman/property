import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a production build. `pnpm test:e2e` builds and
 * starts the app itself (unless PLAYWRIGHT_BASE_URL points at a running one)
 * and expects a seeded database at DATABASE_URL — see .github/workflows/ci.yml
 * for the Postgres service + migrate + seed steps.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /smoke\.spec\.ts/ },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm build && pnpm start --port 3100",
        url: "http://localhost:3100",
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
      },
});
