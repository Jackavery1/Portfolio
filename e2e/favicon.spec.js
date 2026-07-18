import { test, expect } from '@playwright/test';

test('favicon PNG est référencée et accessible', async ({ page, request }) => {
  await page.goto('/index.html');

  const href = await page.locator('link[rel="icon"][type="image/png"]').getAttribute('href');
  expect(href).toContain('assets/favicon.png');

  const urlSansQuery = href?.split('?')[0];
  const response = await request.get(`/${urlSansQuery}`);
  expect(response.ok()).toBeTruthy();
});

test('GET /favicon.ico répond sans 404', async ({ request }) => {
  const response = await request.get('/favicon.ico');
  expect(response.ok()).toBeTruthy();
});

test('apple-touch-icon et og image accessibles', async ({ page, request }) => {
  await page.goto('/index.html');

  const appleHref = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(appleHref).toMatch(/apple-touch-icon\.png/);
  const appleResp = await request.get(`/${appleHref?.split('?')[0]}`);
  expect(appleResp.ok()).toBeTruthy();

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogImage).toMatch(/og\.(png|webp)/);
});
