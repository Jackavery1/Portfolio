import { test, expect } from '@playwright/test';
import {
  gotoReady,
  assertHauteurTactile,
  assertLargeurTactile,
} from './helpers.js';

test('responsive mobile — cibles tactiles ≥ 44px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  await assertHauteurTactile(page.locator('.nav__burger'));
  await assertLargeurTactile(page.locator('.nav__burger'));
  await assertHauteurTactile(page.locator('.bouton-arcade').first());

  await page.locator('.nav__burger').click({ force: true });
  const liensNav = page.locator('.nav__bouton');
  const nbLiensNav = await liensNav.count();
  for (let i = 0; i < nbLiensNav; i += 1) {
    await assertHauteurTactile(liensNav.nth(i));
  }

  await assertHauteurTactile(page.locator('.pied-page__lien').first());
  await assertHauteurTactile(page.locator('a.pied-page__certif-texte'));

  await gotoReady(page, '/projets.html');
  const liensSommaire = page.locator('.projets-sommaire__liste a');
  const nbSommaire = await liensSommaire.count();
  for (let i = 0; i < nbSommaire; i += 1) {
    await assertHauteurTactile(liensSommaire.nth(i));
    await assertLargeurTactile(liensSommaire.nth(i));
  }

  await gotoReady(page, '/contact.html');
  await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
    timeout: 15_000,
  });
  await assertHauteurTactile(page.locator('.bouton-envoyer'));

  await gotoReady(page, '/dojo.html');
  await assertHauteurTactile(page.locator('.boss-carte').first());

  await gotoReady(page, '/projets.html');
  await page.locator('.carte-projet[data-projet="lsf"]').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await assertHauteurTactile(page.locator('.modal-fermer'));
  await assertLargeurTactile(page.locator('.modal-fermer'));
});

test('desktop-large — liens nav horizontaux ≥ 44px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoReady(page, '/index.html');

  const liens = page.locator('.nav__liens .nav__bouton');
  const nb = await liens.count();
  for (let i = 0; i < nb; i += 1) {
    await assertHauteurTactile(liens.nth(i));
  }
});
