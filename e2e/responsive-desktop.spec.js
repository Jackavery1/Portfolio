import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';
import { NAVIGATION_CLAVIER } from './fixtures/responsive.js';

test('landmarks accessibles avant data-app-ready', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('header[role="banner"]')).toBeVisible();
  await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
  await expect(page.locator('main#js-contenu-principal')).toBeVisible();
  await expect(page.locator('header .nav__liens--squelette a')).toHaveCount(5);
});

test('desktop — annonce AT après navigation clavier', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoReady(page, '/index.html');

  await page.keyboard.press('ArrowRight');
  await page.waitForSelector('body[data-app-ready="true"]');

  await expect(page.locator('#js-annonce-navigation')).toContainText(/Page Projets/i);
});

test('desktop — navigation clavier sur tout le menu principal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  await gotoReady(page, NAVIGATION_CLAVIER[0].path);

  for (let i = 1; i < NAVIGATION_CLAVIER.length; i += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page).toHaveURL(
      new RegExp(NAVIGATION_CLAVIER[i].path.replace('.html', '(\\.html)?'))
    );
    await expect(page.locator('h1')).toContainText(NAVIGATION_CLAVIER[i].h1);
  }

  for (let i = NAVIGATION_CLAVIER.length - 2; i >= 0; i -= 1) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page).toHaveURL(
      new RegExp(NAVIGATION_CLAVIER[i].path.replace('.html', '(\\.html)?'))
    );
    await expect(page.locator('h1')).toContainText(NAVIGATION_CLAVIER[i].h1);
  }
});
