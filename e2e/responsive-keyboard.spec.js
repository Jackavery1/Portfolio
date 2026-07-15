import { test, expect } from '@playwright/test';
import { gotoReady, assertIndicateurFocusVisible } from './helpers.js';
import { KONAMI_SEQUENCE, NAVIGATION_CLAVIER } from './fixtures/responsive.js';

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

test('clavier — modale projet piège Tab dans le dialogue', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/projets.html');
  await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
    timeout: 15_000,
  });

  await page.locator('.carte-projet[data-projet="lsf"]').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();

  const fermer = page.locator('.modal-fermer');
  const liens = page.locator('.modal-lien a');
  await expect(fermer).toBeFocused();
  const nbLiens = await liens.count();
  expect(nbLiens).toBeGreaterThan(0);

  for (let i = 0; i < nbLiens; i += 1) {
    await page.keyboard.press('Tab');
    await expect(liens.nth(i)).toBeFocused();
  }

  await page.keyboard.press('Tab');
  await expect(fermer).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(liens.nth(nbLiens - 1)).toBeFocused();
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

test('clavier — mentions sommaire focus visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/mentions-legales.html');

  await assertIndicateurFocusVisible(page.locator('.mentions-sommaire__liste a').first());
});

test('clavier — mentions lien retour focus visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/mentions-legales.html');

  await assertIndicateurFocusVisible(page.locator('.mentions-retour'));
});

test('clavier — zone tableau compétences focus visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/competences.html');

  const zone = page.locator('.scores-tableau-zone');
  await zone.focus();
  await expect(zone).toBeFocused();

  const outlineWidth = await zone.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outlineWidth).not.toBe('0px');
});

test('clavier desktop 1280 — navigation flèches menu principal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
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

test('clavier — code Konami active le mode secret', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoReady(page, '/index.html');

  for (const touche of KONAMI_SEQUENCE) {
    await page.keyboard.press(touche);
  }

  await expect(page.locator('body')).toHaveClass(/konami-actif/);
});

test('clavier — popup high score fermable avec Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/index.html');
  await page.evaluate(() => {
    sessionStorage.setItem('jm_portfolio_score', '9999');
    sessionStorage.removeItem('hs_popup_vu');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('body[data-app-ready="true"]');

  const popup = page.locator('#js-popup-hs');
  await expect(popup).toBeVisible({ timeout: 5000 });
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
});

test('clavier mobile — burger piège Tab dans la nav', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  const burger = page.locator('.nav__burger');
  await burger.click({ force: true });
  await expect(page.locator('#js-menu')).toHaveClass(/ouvert/);

  const liens = page.locator('.nav__bouton');
  await expect(liens.first()).toBeFocused();

  const nbLiens = await liens.count();
  for (let i = 1; i < nbLiens; i += 1) {
    await page.keyboard.press('Tab');
    await expect(liens.nth(i)).toBeFocused();
  }

  await page.keyboard.press('Tab');
  await expect(page.locator('.nav__logo')).toBeFocused();

  await page.keyboard.press('Shift+Tab');
  await expect(liens.last()).toBeFocused();
});
