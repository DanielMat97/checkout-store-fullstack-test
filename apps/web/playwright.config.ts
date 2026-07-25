import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.FE_BASE_URL ?? 'http://localhost:5173';

/**
 * Multi-browser / breakpoint matrix for scorecard B2.
 * refs docs/ux-evidence.md
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'chromium-se',
      use: { ...devices['iPhone SE'], defaultBrowserType: 'chromium' },
      testMatch: /responsive\.smoke\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /responsive\.smoke\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /responsive\.smoke\.spec\.ts/,
    },
  ],
});
