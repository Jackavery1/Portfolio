import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';

test('prefers-reduced-motion — animations désactivées', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page, '/index.html');

  const marqueeAnim = await page
    .locator('.marquee-contenu')
    .evaluate((el) => getComputedStyle(el).animationName);
  const sectionAnim = await page
    .locator('#accueil.section')
    .evaluate((el) => getComputedStyle(el).animationName);

  expect(marqueeAnim).toBe('none');
  expect(sectionAnim).toBe('none');
});
