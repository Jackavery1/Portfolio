import { test, expect } from '@playwright/test';

test('favicon PNG est référencée et accessible', async ({ page, request }) => {
  await page.goto('/index.html');

  const href = await page.locator('link[rel="icon"][type="image/png"]').getAttribute('href');
  expect(href).toContain('assets/favicon.png');

  const urlSansQuery = href?.split('?')[0];
  const response = await request.get(`/${urlSansQuery}`);
  expect(response.ok()).toBeTruthy();
});
