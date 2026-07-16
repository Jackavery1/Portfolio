import { defineConfig, devices } from '@playwright/test';

const PORT = 8765;
const baseURL = `http://127.0.0.1:${PORT}`;
const skipBuild = process.env.PLAYWRIGHT_SKIP_BUILD === '1';

const RESPONSIVE_SPECS = /responsive-.*\.spec\.js/;
const PWA_SPECS = /pwa\.spec\.js/;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 60_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'responsive-mobile-portrait',
      testMatch: [RESPONSIVE_SPECS, PWA_SPECS, /sw-toast\.spec\.js/],
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: 'responsive-mobile-landscape',
      testMatch: [RESPONSIVE_SPECS, PWA_SPECS, /sw-toast\.spec\.js/],
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 667, height: 375 },
      },
    },
    {
      name: 'responsive-tablet',
      testMatch: [RESPONSIVE_SPECS, PWA_SPECS, /sw-toast\.spec\.js/],
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'responsive-webkit',
      testMatch: [RESPONSIVE_SPECS, PWA_SPECS, /sw-toast\.spec\.js/],
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'responsive-firefox',
      testMatch: [RESPONSIVE_SPECS, PWA_SPECS, /sw-toast\.spec\.js/],
      use: {
        browserName: 'firefox',
        viewport: { width: 375, height: 667 },
        hasTouch: true,
      },
    },
    {
      name: 'responsive-desktop-chrome',
      testMatch: [RESPONSIVE_SPECS, PWA_SPECS, /sw-toast\.spec\.js/],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
    {
      name: 'desktop-chrome',
      testIgnore: RESPONSIVE_SPECS,
      testMatch: [PWA_SPECS, /sw-toast\.spec\.js/, /^(?!.*responsive-).*\.spec\.js$/],
      use: {
        ...devices['Desktop Chrome'],
        ...(process.env.CI ? {} : { channel: 'chrome' }),
      },
    },
  ],
  webServer: {
    command: skipBuild
      ? `node build/run-serve-staging.cjs ${PORT}`
      : `npm run build && node build/run-serve-staging.cjs ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
