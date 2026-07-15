import { test, expect } from '@playwright/test';
import { gotoReady, assertContrasteAa } from './helpers.js';

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

test('contraste WCAG AA — nav, champs et carte projet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');

  await assertContrasteAa(page.locator('.nav__bouton'));
  await assertContrasteAa(page.locator('#contact-nom'));
  await assertContrasteAa(page.locator('.champ-label').first());

  await gotoReady(page, '/projets.html');
  await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
    timeout: 15_000,
  });
  await assertContrasteAa(page.locator('.carte-projet').first());
});

test('contraste WCAG AA — titres néon accueil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  await assertContrasteAa(page.locator('.titre-arcade__nom'), 3);
  await assertContrasteAa(page.locator('.titre-arcade__prenom'));
  await assertContrasteAa(page.locator('.arcade-label').first());
});

test('contraste WCAG AA — titres section et cartes projets', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/projets.html');
  await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
    timeout: 15_000,
  });

  await assertContrasteAa(page.locator('h1.titre-section'), 3);
  await assertContrasteAa(page.locator('.carte-projet__nom').first());
  await assertContrasteAa(page.locator('.carte-projet__desc').first());

  await gotoReady(page, '/competences.html');
  await assertContrasteAa(page.locator('h1.titre-section'), 3);

  await gotoReady(page, '/dojo.html');
  await assertContrasteAa(page.locator('h1.titre-section'), 3);
  await assertContrasteAa(page.locator('.boss-carte__nom').first());

  await gotoReady(page, '/contact.html');
  await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
    timeout: 15_000,
  });
  await assertContrasteAa(page.locator('h1.titre-section'), 3);
});

test('contraste WCAG AA — mentions légales sommaire', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/mentions-legales.html');

  await assertContrasteAa(page.locator('.mentions-sommaire__liste a').first(), 3);

  const email = page.locator('#js-mentions-email');
  await expect(email).toBeVisible();
  await expect(email).not.toHaveText('Chargement…');
  await assertContrasteAa(email);
});

test('contraste WCAG AA — parcours et page offline', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/parcours.html');
  await page.waitForSelector('.entree-parcours__titre', { timeout: 15_000 });

  await assertContrasteAa(page.locator('h1.titre-section'), 3);
  await assertContrasteAa(page.locator('.entree-parcours__titre').first());

  await page.goto('/offline.html', { waitUntil: 'domcontentloaded' });
  await assertContrasteAa(page.locator('.offline-ecran p').first());
  await assertContrasteAa(page.locator('.offline-ecran a'));
});
