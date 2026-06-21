import { defineConfig, devices } from '@playwright/test';

// The production GitHub Pages *project site* for this repo. Tests run against
// this by default so `npx playwright test` verifies the real, deployed site.
const PRODUCTION_URL = 'https://nikomix.github.io/mspartner/';

// Three ways to point the suite at a target:
//   (default)        → the live GitHub Pages URL above.
//   E2E_BASE_URL=... → an explicit URL (e.g. the freshly deployed `page_url`).
//   E2E_LOCAL=1      → build the static export and serve it locally, then test
//                      that (used for pull-request validation before deploy).
const useLocalServer = process.env.E2E_LOCAL === '1';
const PORT = Number(process.env.E2E_PORT ?? 3100);
const LOCAL_URL = `http://127.0.0.1:${PORT}/`;

function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

const baseURL = withTrailingSlash(
  useLocalServer ? LOCAL_URL : process.env.E2E_BASE_URL ?? PRODUCTION_URL,
);

export default defineConfig({
  testDir: './tests/e2e',
  // Per-file parallelism; link-health uses internal pacing/retries instead.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }], ['list']]
    : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    // UI behaviour is verified across the major engines + a mobile profile.
    {
      name: 'chromium',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      testMatch: 'ui/**/*.spec.ts',
      use: { ...devices['Pixel 7'] },
    },
    // Link health + DOM/catalog parity are engine-agnostic HTTP checks, so they
    // run once (Chromium) to avoid hammering external hosts four times over.
    // `ignoreHTTPSErrors` keeps the reachability probe robust behind TLS-
    // inspecting proxies (corporate / CI egress) — we assert the final HTTP
    // status after following redirects, not third-party certificate chains.
    {
      name: 'linkcheck',
      testMatch: 'health/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], ignoreHTTPSErrors: true },
    },
  ],
  webServer: useLocalServer
    ? {
        command: `npm run build && node scripts/serve-static.mjs out --port ${PORT}`,
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
        stdout: 'pipe',
        stderr: 'pipe',
        env: { PAGES_BASE_PATH: '' },
      }
    : undefined,
});
