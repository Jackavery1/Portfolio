import { test, expect } from '@playwright/test';
import { gotoReady, simulerInsetHaut, simulerInsets } from './helpers.js';

test('safe-area — marquee et nav sans encoche', async ({ page }) => {
  await gotoReady(page, '/index.html');

  const marqueeHeight = await page
    .locator('.marquee-bande')
    .evaluate((el) => getComputedStyle(el).height);
  const navTop = await page.locator('.nav').evaluate((el) => getComputedStyle(el).top);

  expect(marqueeHeight).toBe('32px');
  expect(navTop).toBe('32px');
});

test('safe-area — insets simulés (encoche haut)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page, '/index.html');
  await simulerInsetHaut(page, 20);

  const marqueeHeight = await page
    .locator('.marquee-bande')
    .evaluate((el) => getComputedStyle(el).height);
  const navTop = await page.locator('.nav').evaluate((el) => getComputedStyle(el).top);

  expect(marqueeHeight).toBe('52px');
  expect(navTop).toBe('52px');
});

test('safe-area — inset bas simulé sur contact mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');
  await simulerInsets(page, { bas: 24 });

  const paddingBas = await page
    .locator('body[data-section-id="contact"] .section')
    .evaluate((el) => getComputedStyle(el).paddingBottom);

  expect(paddingBas).toBe('24px');
});
