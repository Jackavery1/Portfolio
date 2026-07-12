import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';
import { NAVIGATION_CLAVIER } from './fixtures/responsive.js';

function patternUrlMenu(chemin) {
  if (chemin === '/index.html') return /\/(index\.html)?$/;
  return new RegExp(`${chemin.replace('.html', '(\\.html)?')}$`);
}

test('clavier mobile — burger et fermeture Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  const burger = page.locator('.nav__burger');
  for (let i = 0; i < 12; i += 1) {
    if (await burger.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await expect(burger).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(burger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#js-menu')).toHaveClass(/ouvert/);

  await page.keyboard.press('Escape');
  await expect(burger).toHaveAttribute('aria-expanded', 'false');
});

test('clavier mobile — modale projet fermable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/projets.html');

  await page.locator('.carte-projet').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#js-modal')).toBeHidden();
});

test('clavier tablette — navigation flèches sur tout le menu principal', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await gotoReady(page, NAVIGATION_CLAVIER[0].path);

  for (let i = 1; i < NAVIGATION_CLAVIER.length; i += 1) {
    const urlPattern = patternUrlMenu(NAVIGATION_CLAVIER[i].path);
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(urlPattern, { timeout: 10_000 });
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page.locator('h1')).toContainText(NAVIGATION_CLAVIER[i].h1);
  }

  for (let i = NAVIGATION_CLAVIER.length - 2; i >= 0; i -= 1) {
    const urlPattern = patternUrlMenu(NAVIGATION_CLAVIER[i].path);
    await page.keyboard.press('ArrowLeft');
    await page.waitForURL(urlPattern, { timeout: 10_000 });
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page.locator('h1')).toContainText(NAVIGATION_CLAVIER[i].h1);
  }
});
