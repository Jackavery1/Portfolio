import { defineConfig, devices } from '@playwright/test';

const PORT = 8765;
const baseURL = `http://127.0.0.1:${PORT}`;

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
      name: 'responsive',
      testMatch: RESPONSIVE_SPECS,
      use: {
        ...devices['Pixel 5'],
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
    {
      name: 'mobile-chrome',
      testIgnore: RESPONSIVE_SPECS,
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],
  webServer: {
    command: `npm run build && npx serve .dist-staging -l ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
