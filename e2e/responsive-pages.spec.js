import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';
import { VIEWPORTS_BURGER, assertPasOverflowHorizontal } from './fixtures/responsive.js';

test('responsive mobile — sommaire projets et 6 cartes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/projets.html');

  await expect(page.locator('.projets-sommaire__liste a')).toHaveCount(6);
  await expect(page.locator('.carte-projet')).toHaveCount(6);
  await expect(page.locator('.carte-projet[data-projet="derniereligne"]')).toBeVisible();
});

test('responsive mobile — scroll contact', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
  expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
  await assertPasOverflowHorizontal(page);
});

test('responsive mobile étroit — contact, dojo et mentions sans overflow (280px)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 280, height: 568 });

  for (const path of ['/contact.html', '/dojo.html', '/mentions-legales.html']) {
    await gotoReady(page, path);
    await assertPasOverflowHorizontal(page);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('responsive contact — champ message visible après focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');
  await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
    timeout: 15_000,
  });

  const message = page.locator('#contact-message');
  await message.scrollIntoViewIfNeeded();
  await message.focus();

  const visible = await message.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const vv = window.visualViewport;
    const hauteur = vv?.height ?? window.innerHeight;
    return rect.top >= 0 && rect.bottom <= hauteur + 1;
  });
  expect(visible).toBe(true);
});

for (const viewport of VIEWPORTS_BURGER) {
  test(`responsive ${viewport.label} — burger nav sans overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoReady(page, '/index.html');

    const burger = page.locator('.nav__burger');
    await expect(burger).toBeVisible();
    await burger.click({ force: true });
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#js-menu')).toHaveClass(/ouvert/);
    await expect(page.locator('body')).toHaveClass(/nav-scroll-lock/);
    await assertPasOverflowHorizontal(page);

    await page.keyboard.press('Escape');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveClass(/nav-scroll-lock/);
  });

  test(`responsive ${viewport.label} — modale projet sans overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoReady(page, '/projets.html');

    const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
    await expect(carte).toBeVisible();
    await carte.click({ force: true });
    await expect(page.locator('#js-modal')).toBeVisible();
    await assertPasOverflowHorizontal(page);
  });
}

test('responsive paysage mobile — modale projet sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/projets.html');

  const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
  await expect(carte).toBeVisible();
  await carte.click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await expect(page.locator('.modal-fermer')).toBeVisible();
  await assertPasOverflowHorizontal(page);
});

test('responsive paysage mobile — compétences sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/competences.html');

  await expect(page.locator('h1')).toContainText(/HIGH SCORES/i);
  await expect(page.locator('.scores-tableau')).toBeVisible();
  await assertPasOverflowHorizontal(page);
});

test('responsive paysage mobile — dojo sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/dojo.html');

  await expect(page.locator('h1')).toContainText(/DOJO/i);
  await expect(page.locator('.boss-carte').first()).toBeVisible();
  await assertPasOverflowHorizontal(page);
});
