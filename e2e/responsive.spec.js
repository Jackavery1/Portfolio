import { test, expect } from '@playwright/test';
import {
  gotoReady,
  lireEntreesPrecache,
  precacheContient,
  preparerServiceWorker,
  assertHauteurTactile,
  assertLargeurTactile,
} from './helpers.js';

const PAGES = [
  { path: '/index.html', h1: /MARTINEZ/i },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
  { path: '/competences.html', h1: /HIGH SCORES/i },
  { path: '/parcours.html', h1: /STORY MODE/i },
  { path: '/contact.html', h1: /CONTINUE/i },
  { path: '/dojo.html', h1: /DOJO/i },
  { path: '/mentions-legales.html', h1: /MENTIONS/i },
];

const VIEWPORTS = [
  { width: 320, height: 568, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
  { width: 961, height: 800, label: 'desktop' },
];

async function assertPasOverflowHorizontal(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

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

test('responsive mobile — cibles tactiles ≥ 44px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  await assertHauteurTactile(page.locator('.nav__burger'));
  await assertLargeurTactile(page.locator('.nav__burger'));
  await assertHauteurTactile(page.locator('.bouton-arcade').first());

  await gotoReady(page, '/dojo.html');
  await assertHauteurTactile(page.locator('.boss-carte').first());

  await gotoReady(page, '/projets.html');
  await page.locator('.carte-projet[data-projet="lsf"]').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await assertHauteurTactile(page.locator('.modal-fermer'));
  await assertLargeurTactile(page.locator('.modal-fermer'));
});

test('safe-area — marquee et nav sticky', async ({ page }) => {
  await gotoReady(page, '/index.html');

  const marqueeHeight = await page
    .locator('.marquee-bande')
    .evaluate((el) => getComputedStyle(el).height);
  const navTop = await page.locator('.nav').evaluate((el) => getComputedStyle(el).top);

  expect(marqueeHeight).toBe('32px');
  expect(navTop).toBe('32px');
});

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

test('responsive mobile étroit — contact et dojo sans overflow (280px)', async ({ page }) => {
  await page.setViewportSize({ width: 280, height: 568 });

  for (const path of ['/contact.html', '/dojo.html']) {
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

test('manifest PWA — présent et valide', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest');
  expect(response?.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toContain('index.html');
  expect(manifest.icons?.length).toBeGreaterThanOrEqual(3);
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true);
});

test('lien manifest dans le head', async ({ page }) => {
  await gotoReady(page, '/index.html');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    'manifest.webmanifest'
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    /apple-touch-icon\.png/
  );
});

test('page offline — accessible et meta PWA', async ({ page }) => {
  const response = await page.goto('/offline.html');
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h1')).toContainText(/hors ligne/i);
  await expect(page.locator('a[href="index.html"]')).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    'manifest.webmanifest'
  );
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/
  );
});

test.describe('service worker', () => {
  test.describe.configure({ mode: 'serial' });

  test('precache PWA — offline, previews et volume', async ({ page }) => {
    test.setTimeout(60_000);
    await preparerServiceWorker(page);

    const { urls } = await lireEntreesPrecache(page);
    expect(urls.length).toBeGreaterThanOrEqual(60);
    expect(precacheContient(urls, 'offline.html')).toBe(true);
    expect(
      precacheContient(urls, 'assets/previews/lsf.webp') ||
        precacheContient(urls, 'assets/previews/lsf.png')
    ).toBe(true);
  });

  test('navigation hors ligne — precache et fallback offline.html', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit : navigation offline instable en CI');
    test.setTimeout(60_000);
    await preparerServiceWorker(page);

    await gotoReady(page, '/projets.html');
    await page.goto('/offline.html', { waitUntil: 'domcontentloaded' });
    await context.setOffline(true);
    try {
      await page.goto('/projets.html', { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await expect(page.locator('h1')).toContainText(/SELECT YOUR STAGE/i, { timeout: 15_000 });

      await page.goto('/page-inconnue.html', { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await expect(page.locator('h1')).toContainText(/Mode hors ligne/i, { timeout: 15_000 });
      await expect(page.getByRole('link', { name: /accueil/i })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test('enregistré après chargement', async ({ page }) => {
    await gotoReady(page, '/index.html');

    const swUrl = await page.evaluate(async () => {
      const delai = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (let i = 0; i < 150; i += 1) {
        if (!('serviceWorker' in navigator)) return null;
        const registration = await navigator.serviceWorker.getRegistration();
        const url =
          registration?.active?.scriptURL ??
          registration?.installing?.scriptURL ??
          registration?.waiting?.scriptURL ??
          null;
        if (url) return url;
        await delai(200);
      }
      return null;
    });

    expect(swUrl).toContain('sw.js');
  });
});

for (const viewport of [
  { width: 375, height: 667, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
]) {
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
