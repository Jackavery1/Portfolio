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

test('safe-area — insets latéraux sur ecran et body', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');
  await simulerInsets(page, { gauche: 16, droite: 16 });

  const paddingBody = await page.locator('body').evaluate((el) => getComputedStyle(el).paddingLeft);
  const paddingEcran = await page
    .locator('.ecran')
    .evaluate((el) => getComputedStyle(el).paddingLeft);

  expect(paddingBody).toBe('16px');
  expect(paddingEcran).toBe('16px');
});

test('safe-area — scénario encoche iOS simulée (4 insets)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoReady(page, '/index.html');
  await simulerInsets(page, { haut: 47, bas: 34, gauche: 0, droite: 0 });

  const navTop = await page.locator('.nav').evaluate((el) => getComputedStyle(el).top);
  const marqueeHeight = await page
    .locator('.marquee-bande')
    .evaluate((el) => getComputedStyle(el).height);

  expect(marqueeHeight).toBe('79px');
  expect(navTop).toBe('79px');
});

test('safe-area — toast SW avec inset bas simulé', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');
  await simulerInsets(page, { bas: 20, gauche: 12, droite: 12 });

  await page.evaluate(() => {
    const toast = document.createElement('div');
    toast.id = 'js-sw-toast';
    toast.className = 'sw-toast';
    toast.innerHTML = '<p class="sw-toast__texte">Test</p>';
    document.body.appendChild(toast);
    toast.hidden = false;
  });

  const bottom = await page.locator('#js-sw-toast').evaluate((el) => getComputedStyle(el).bottom);
  expect(bottom).not.toBe('0px');
});
