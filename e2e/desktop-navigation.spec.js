import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';
import { NAVIGATION_CLAVIER } from './fixtures/responsive.js';

function patternUrlMenu(chemin) {
  if (chemin === '/index.html') return /\/(index\.html)?$/;
  return new RegExp(`${chemin.replace('.html', '(\\.html)?')}$`);
}

test('landmarks accessibles avant data-app-ready', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('header[role="banner"]')).toBeVisible();
  await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
  await expect(page.locator('main#js-contenu-principal')).toBeVisible();
  await expect(page.locator('header .nav__bouton')).toHaveCount(5);
});

test('desktop — annonce AT après navigation clavier', async ({ page }) => {
  await gotoReady(page, '/index.html');

  await page.keyboard.press('ArrowRight');
  await page.waitForSelector('body[data-app-ready="true"]');

  await expect(page.locator('#js-annonce-navigation')).toContainText(/Page Projets/i);
});

test('desktop — navigation clavier sur tout le menu principal', async ({ page }) => {
  await gotoReady(page, NAVIGATION_CLAVIER[0].path);

  for (let i = 1; i < NAVIGATION_CLAVIER.length; i += 1) {
    const urlPattern = patternUrlMenu(NAVIGATION_CLAVIER[i].path);
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(urlPattern, { timeout: 10_000 });
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page).toHaveURL(urlPattern);
    await expect(page.locator('h1')).toContainText(NAVIGATION_CLAVIER[i].h1);
  }

  for (let i = NAVIGATION_CLAVIER.length - 2; i >= 0; i -= 1) {
    const urlPattern = patternUrlMenu(NAVIGATION_CLAVIER[i].path);
    await page.keyboard.press('ArrowLeft');
    await page.waitForURL(urlPattern, { timeout: 10_000 });
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page).toHaveURL(urlPattern);
    await expect(page.locator('h1')).toContainText(NAVIGATION_CLAVIER[i].h1);
  }
});
