import { test, expect } from '@playwright/test';
import {
  gotoReady,
  lireEntreesPrecache,
  precacheContient,
  preparerServiceWorker,
} from './helpers.js';

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
    test.setTimeout(browserName === 'webkit' ? 90_000 : 60_000);
    await preparerServiceWorker(page);

    await gotoReady(page, '/projets.html');
    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
      await expect(page.locator('h1')).toContainText(/SELECT YOUR STAGE/i, { timeout: 20_000 });

      const offlinePrecache = await page.evaluate(async () => {
        const keys = await caches.keys();
        const cacheName = keys.find((name) => name.startsWith('portfolio-arcade'));
        if (!cacheName) return null;
        const cache = await caches.open(cacheName);
        const candidates = ['offline.html', '/offline.html', `${location.origin}/offline.html`];
        for (const url of candidates) {
          const match = await cache.match(url);
          if (match) return match.text();
        }
        const requests = await cache.keys();
        const offlineReq = requests.find((req) => req.url.endsWith('/offline.html'));
        return offlineReq ? (await cache.match(offlineReq)).text() : null;
      });
      expect(offlinePrecache).toContain('Mode hors ligne');

      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
      await expect(page.locator('h1')).toContainText(/SELECT YOUR STAGE/i, { timeout: 20_000 });
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
