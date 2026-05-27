import { defineConfig, devices } from '@playwright/test';

const PORT = 8765;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'on-first-retry',
    ...(process.env.CI ? {} : { channel: 'chrome' }),
  },
  webServer: {
    command: `npm run build && npx serve .dist-staging -l ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
