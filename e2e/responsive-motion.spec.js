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

  const crtScanlines = await page
    .locator('.crt-scanlines')
    .evaluate((el) => getComputedStyle(el).display);
  expect(crtScanlines).toBe('none');

  const transitionLien = await page
    .locator('.bouton-arcade')
    .first()
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(Number.parseFloat(transitionLien) || 0).toBeLessThan(0.05);

  await gotoReady(page, '/dojo.html');
  const bossFlash = await page
    .locator('.boss-carte__sprite--pulse')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(bossFlash).toBe('none');

  await gotoReady(page, '/contact.html');
  const bandeauAnim = await page
    .locator('.contact-bandeau')
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(bandeauAnim).toBe('none');

  await gotoReady(page, '/projets.html');
  const barreCompletion = await page
    .locator('.barre-completion__fill')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(barreCompletion).toBe('none');

  const badgeActif = page.locator('.badge--actif').first();
  if ((await badgeActif.count()) > 0) {
    const badgeAnim = await badgeActif.evaluate((el) => getComputedStyle(el).animationName);
    expect(badgeAnim).toBe('none');
  }
});
