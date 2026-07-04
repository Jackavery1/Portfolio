import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';
import { PAGES, VIEWPORTS, assertPasOverflowHorizontal } from './fixtures/responsive.js';

for (const viewport of VIEWPORTS) {
  for (const pageInfo of PAGES) {
    test(`responsive ${viewport.label} — ${pageInfo.path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoReady(page, pageInfo.path);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText(pageInfo.h1);
      await assertPasOverflowHorizontal(page);

      const viewportMeta = page.locator('meta[name="viewport"]');
      await expect(viewportMeta).toHaveAttribute('content', /viewport-fit=cover/);

      if (pageInfo.path === '/parcours.html') {
        await expect(page.locator('.entree-parcours')).not.toHaveCount(0);
        await expect(page.locator('.svg-arbre')).toBeVisible();
      }
    });
  }
}

test('responsive paysage accueil — scroll et hero visibles', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await gotoReady(page, '/index.html');

  await expect(page.locator('h1')).toContainText(/MARTINEZ/i);
  await expect(page.locator('.accueil__grille')).toBeVisible();
  await assertPasOverflowHorizontal(page);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
  expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
});

test('responsive seuil nav — burger à 960px, liens horizontaux à 961px', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 800 });
  await gotoReady(page, '/index.html');
  await expect(page.locator('.nav__burger')).toBeVisible();
  await expect(page.locator('.nav__liens')).not.toBeVisible();

  await page.setViewportSize({ width: 961, height: 800 });
  await gotoReady(page, '/index.html');
  await expect(page.locator('.nav__burger')).not.toBeVisible();
  await expect(page.locator('.nav__liens')).toBeVisible();
});

test('responsive score arcade — visible en compact, label masqué', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');
  await expect(page.locator('#js-score')).toBeVisible();
  await expect(page.locator('.arcade-label')).toBeHidden();
});

test('responsive paysage matrice — pas d’overflow horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/index.html');
  await assertPasOverflowHorizontal(page);
});
