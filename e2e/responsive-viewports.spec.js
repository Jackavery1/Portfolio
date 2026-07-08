import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';
import {
  PAGE_COQUILLE,
  PAGES,
  PAGES_COQUILLE_ETENDUES,
  VIEWPORTS,
  VIEWPORTS_ETENDUS,
  VIEWPORT_MOBILE,
  assertPasOverflowHorizontal,
} from './fixtures/responsive.js';

for (const viewport of VIEWPORTS) {
  test(`responsive ${viewport.label} — coquille accueil`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoReady(page, PAGE_COQUILLE.path);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(PAGE_COQUILLE.h1);
    await assertPasOverflowHorizontal(page);

    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /viewport-fit=cover/);
  });
}

for (const viewport of VIEWPORTS_ETENDUS) {
  for (const pageInfo of PAGES_COQUILLE_ETENDUES) {
    test(`responsive ${viewport.label} — coquille ${pageInfo.path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoReady(page, pageInfo.path);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText(pageInfo.h1);
      await assertPasOverflowHorizontal(page);
    });
  }
}

for (const pageInfo of PAGES.slice(1)) {
  test(`responsive mobile-compact — ${pageInfo.path}`, async ({ page }) => {
    await page.setViewportSize({
      width: VIEWPORT_MOBILE.width,
      height: VIEWPORT_MOBILE.height,
    });
    await gotoReady(page, pageInfo.path);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(pageInfo.h1);
    await assertPasOverflowHorizontal(page);

    if (pageInfo.path === '/parcours.html') {
      await expect(page.locator('.entree-parcours')).not.toHaveCount(0);
      await expect(page.locator('.svg-arbre')).toBeVisible();
    }
  });
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

test('responsive score arcade — label et valeur visibles en portrait compact', async ({ page }) => {
  await page.setViewportSize({
    width: VIEWPORT_MOBILE.width,
    height: VIEWPORT_MOBILE.height,
  });
  await gotoReady(page, '/index.html');
  await expect(page.locator('#js-score')).toBeVisible();
  await expect(page.locator('.arcade-label')).toBeVisible();
  await expect(page.locator('.arcade-label')).toHaveText('SCORE');
});

test('accessibility zoom 200% — pas overflow horizontal', async ({ page }) => {
  await gotoReady(page, '/index.html');

  await page.evaluate(() => {
    document.documentElement.style.zoom = '200%';
  });

  const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
  const windowWidth = await page.evaluate(() => window.innerWidth);

  expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  expect(hasHorizontalScroll).toBe(false);
});
