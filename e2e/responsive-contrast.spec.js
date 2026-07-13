import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';

test('prefers-contrast: more — renforce la lisibilité nav et champs', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ contrast: 'no-preference' });
  await gotoReady(page, '/contact.html');

  const lireCouleurNav = () =>
    page
      .locator('.nav__bouton')
      .first()
      .evaluate((el) => getComputedStyle(el).color);

  const couleurStandard = await lireCouleurNav();

  await page.emulateMedia({ contrast: 'more' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('body[data-app-ready="true"]');

  const couleurContraste = await lireCouleurNav();
  expect(couleurContraste).not.toBe(couleurStandard);

  const bordureChamp = await page
    .locator('.champ-input')
    .first()
    .evaluate((el) => getComputedStyle(el).borderTopColor);
  expect(bordureChamp).toBeTruthy();
});
