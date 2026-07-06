import { defineConfig, devices } from '@playwright/test';

const PORT = 8765;
const baseURL = `http://127.0.0.1:${PORT}`;
const skipBuild = process.env.PLAYWRIGHT_SKIP_BUILD === '1';

const RESPONSIVE_SPECS = /responsive-.*\.spec\.js/;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'responsive-mobile-portrait',
      testMatch: RESPONSIVE_SPECS,
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'responsive-mobile-landscape',
      testMatch: RESPONSIVE_SPECS,
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 667, height: 375 },
      },
    },
    {
      name: 'responsive-tablet',
      testMatch: RESPONSIVE_SPECS,
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'responsive-webkit',
      testMatch: RESPONSIVE_SPECS,
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'desktop-chrome',
      testIgnore: RESPONSIVE_SPECS,
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
  ],
  webServer: {
    command: skipBuild
      ? `npx serve .dist-staging -l ${PORT}`
      : `npm run build && npx serve .dist-staging -l ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
