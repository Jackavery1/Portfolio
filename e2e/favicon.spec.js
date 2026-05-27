import { test, expect } from '@playwright/test';

test('favicon PNG est référencée et accessible', async ({ page, request }) => {
  await page.goto('/index.html');

  const href = await page.locator('link[rel="icon"][type="image/png"]').getAttribute('href');
  expect(href).toBe('assets/favicon.png');

  const response = await request.get(`/${href}`);
  expect(response.ok()).toBeTruthy();
});
