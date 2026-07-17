import { test, expect } from '@playwright/test';
import { gotoReady, erreursConsoleBloquantes } from './helpers.js';
import { assertZoom200SansOverflow } from './fixtures/responsive.js';

test('page dojo charge sans erreur console critique', async ({ page }) => {
  const erreurs = [];
  page.on('pageerror', (err) => erreurs.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') erreurs.push(msg.text());
  });

  await gotoReady(page, '/dojo.html');

  await expect(page.locator('h1.titre-section')).toContainText(/DOJO/i);
  await expect(page.locator('.boss-rush .boss-carte').first()).toBeVisible();
  await expect(page.locator('.boss-carte[data-boss]')).not.toHaveCount(0);
  await expect(page.locator('.boss-carte__sprite').first()).toBeVisible();
  await expect(page.locator('.boss-carte__nom').first()).toBeVisible();

  const bloquantes = erreursConsoleBloquantes(erreurs).filter(
    (e) => !/serviceWorker|service worker|sw\.js/i.test(e)
  );
  expect(bloquantes).toEqual([]);
});

test('page dojo — cartes en cours ont une barre HP visible', async ({ page }) => {
  await gotoReady(page, '/dojo.html');
  const fills = page.locator('.boss-carte--en-cours .boss-carte__vie-fill');
  await expect(fills).not.toHaveCount(0);
  const count = await fills.count();
  for (let i = 0; i < count; i++) {
    const fill = fills.nth(i);
    await expect(fill).toBeVisible();
    const widthPx = await fill.evaluate((el) => el.getBoundingClientRect().width);
    expect(widthPx).toBeGreaterThan(2);
  }
});

test('page dojo zoom 200% — cartes et sprites sans overflow', async ({ page }) => {
  await gotoReady(page, '/dojo.html');
  await expect(page.locator('.boss-carte__sprite').first()).toBeVisible();
  await assertZoom200SansOverflow(page, { visible: '.boss-carte__sprite' });
});
