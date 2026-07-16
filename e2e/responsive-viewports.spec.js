import { test, expect } from '@playwright/test';
import { gotoReady, gotoPage } from './helpers.js';
import {
  PAGE_COQUILLE,
  PAGES,
  PAGES_COQUILLE_ETENDUES,
  VIEWPORTS,
  VIEWPORTS_ETENDUS,
  VIEWPORT_MOBILE,
  VIEWPORT_ETROIT,
  VIEWPORT_ETROIT_PAYSAGE,
  VIEWPORT_LHCI,
  assertPasOverflowHorizontal,
  assertZoom200SansOverflow,
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

for (const pageInfo of PAGES) {
  test(`responsive mobile-etroit — ${pageInfo.path} sans overflow`, async ({ page }) => {
    await page.setViewportSize(VIEWPORT_ETROIT);
    await gotoReady(page, pageInfo.path);

    if (pageInfo.path === '/contact.html') {
      await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
        timeout: 15_000,
      });
    }

    if (pageInfo.path === '/projets.html') {
      await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
        timeout: 15_000,
      });
    }

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText(pageInfo.h1);
    await assertPasOverflowHorizontal(page);
  });
}

test('responsive mobile-etroit — /offline.html sans overflow', async ({ page }) => {
  await page.setViewportSize(VIEWPORT_ETROIT);
  await gotoPage(page, '/offline.html');
  await expect(page.locator('.offline-ecran')).toBeVisible();
  await expect(page.locator('.offline-ecran a[href="index.html"]')).toBeVisible();
  await assertPasOverflowHorizontal(page);
});

const PAGES_SEUIL_NAV = PAGES;

for (const pageInfo of PAGES_SEUIL_NAV) {
  test(`responsive desktop 961px — ${pageInfo.path} sans overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 961, height: 800 });
    await gotoReady(page, pageInfo.path);

    if (pageInfo.path === '/contact.html') {
      await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
        timeout: 15_000,
      });
    }

    if (pageInfo.path === '/projets.html') {
      await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
        timeout: 15_000,
      });
    }

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.nav__liens')).toBeVisible();
    await expect(page.locator('.nav__burger')).not.toBeVisible();
    await assertPasOverflowHorizontal(page);
  });
}

for (const path of ['/index.html', '/competences.html', '/dojo.html']) {
  test(`responsive lhci-mobile — ${path} coquille sans overflow`, async ({ page }) => {
    await page.setViewportSize(VIEWPORT_LHCI);
    await gotoReady(page, path);
    await expect(page.locator('h1')).toBeVisible();
    await assertPasOverflowHorizontal(page);
  });
}

const PAGES_PAYSAGE = [
  { path: '/index.html', h1: /MARTINEZ/i, contenu: '.accueil__grille' },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i, contenu: '.grille-projets' },
  { path: '/competences.html', h1: /HIGH SCORES/i, contenu: '.langue-item' },
  { path: '/parcours.html', h1: /STORY MODE/i, contenu: '.svg-arbre' },
  { path: '/dojo.html', h1: /DOJO/i, contenu: '.boss-carte' },
  {
    path: '/contact.html',
    h1: /CONTINUE/i,
    contenu: '.bouton-envoyer',
    avantAssertion: async (page) => {
      await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
        timeout: 15_000,
      });
    },
  },
  {
    path: '/mentions-legales.html',
    h1: /MENTIONS/i,
    contenu: '.mentions-sommaire__liste',
  },
];

for (const pageInfo of PAGES_PAYSAGE) {
  test(`responsive paysage — ${pageInfo.path} scroll et contenu visibles`, async ({ page }) => {
    await page.setViewportSize(VIEWPORT_ETROIT_PAYSAGE);
    await gotoReady(page, pageInfo.path);

    if (pageInfo.avantAssertion) {
      await pageInfo.avantAssertion(page);
    }

    await expect(page.locator('h1')).toContainText(pageInfo.h1);
    await expect(page.locator(pageInfo.contenu).first()).toBeVisible();
    await assertPasOverflowHorizontal(page);

    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
    expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
  });
}

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

const PAGES_ZOOM_200 = [
  { path: '/index.html', visible: 'h1.titre-arcade' },
  {
    path: '/projets.html',
    visible: '.carte-projet',
    async preparer(page) {
      await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
        timeout: 15_000,
      });
    },
  },
  { path: '/competences.html', visible: 'h1.titre-section' },
  { path: '/parcours.html', visible: '.svg-arbre' },
  { path: '/mentions-legales.html', visible: '.mentions-sommaire' },
  { path: '/dojo.html', visible: '.boss-carte__sprite' },
  { path: '/offline.html', visible: '.offline-ecran' },
  {
    path: '/contact.html',
    visible: '#contact-nom',
    async preparer(page) {
      await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
        timeout: 15_000,
      });
    },
  },
];

for (const pageInfo of PAGES_ZOOM_200) {
  test(`accessibility zoom 200% — ${pageInfo.path} sans overflow`, async ({ page }) => {
    await gotoPage(page, pageInfo.path);
    if (pageInfo.preparer) {
      await pageInfo.preparer(page);
    }
    await assertZoom200SansOverflow(page, { visible: pageInfo.visible });
  });
}

test('accessibility zoom 200% projets — modale sans overflow', async ({ page }) => {
  await gotoReady(page, '/projets.html');
  await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
    timeout: 15_000,
  });

  await page.locator('.carte-projet[data-projet="lsf"]').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();

  await assertZoom200SansOverflow(page, { visible: '.modal-fermer' });
});
