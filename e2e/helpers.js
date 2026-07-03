import { expect } from '@playwright/test';

export async function gotoReady(page, path) {
  await page.goto(path);
  await page.waitForSelector('body[data-app-ready="true"]');
}

export async function waitForServiceWorker(page) {
  await page.waitForFunction(
    async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(
        registration?.active?.scriptURL ??
        registration?.installing?.scriptURL ??
        registration?.waiting?.scriptURL
      );
    },
    undefined,
    { timeout: 20_000 }
  );
}

export async function lireEntreesPrecache(page) {
  return page.evaluate(async () => {
    const keys = await caches.keys();
    const cacheName = keys.find((name) => name.startsWith('portfolio-arcade')) ?? keys[0];
    if (!cacheName) return { urls: [] };
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    return { urls: requests.map((request) => request.url) };
  });
}

export function precacheContient(urls, fragment) {
  return urls.some((url) => url.includes(fragment));
}

export async function assertHauteurTactile(locator, minPx = 44) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.height).toBeGreaterThanOrEqual(minPx - 1);
}

export async function assertLargeurTactile(locator, minPx = 44) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(minPx - 1);
}

/** Simule les encoches (safe-area) via custom properties testables en E2E. */
export async function simulerInsets(page, { haut = 0, bas = 0, gauche = 0, droite = 0 } = {}) {
  await page.evaluate(
    ({ haut: top, bas: bottom, gauche: left, droite: right }) => {
      if (top) document.documentElement.style.setProperty('--safe-area-inset-top', `${top}px`);
      if (bottom) {
        document.documentElement.style.setProperty('--safe-area-inset-bottom', `${bottom}px`);
      }
      if (left) document.documentElement.style.setProperty('--safe-area-inset-left', `${left}px`);
      if (right) document.documentElement.style.setProperty('--safe-area-inset-right', `${right}px`);
    },
    { haut, bas, gauche, droite }
  );
}

export async function simulerInsetHaut(page, px = 20) {
  await simulerInsets(page, { haut: px });
}

export async function attendrePrecachePwa(page, { minEntrees = 60, timeoutMs = 45_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { urls } = await lireEntreesPrecache(page);
    if (urls.length >= minEntrees && precacheContient(urls, 'offline.html')) {
      return urls;
    }
    await page.waitForTimeout(200);
  }
  throw new Error('Precache PWA incomplet (offline.html ou volume)');
}

export async function preparerServiceWorker(page) {
  await gotoReady(page, '/index.html');
  await waitForServiceWorker(page);

  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('body[data-app-ready="true"]', { timeout: 15_000 });
    await waitForServiceWorker(page);
  }

  await attendrePrecachePwa(page);
}

export async function mockRecaptcha(page) {
  await page.addInitScript(() => {
    window.__E2E_RECAPTCHA_TOKEN = 'e2e-mock-recaptcha-token';
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: () => Promise.resolve('e2e-mock-recaptcha-token'),
      render: () => 1,
      getResponse: () => 'e2e-mock-recaptcha-token',
      reset: () => {},
    };
  });

  await page.route('**/recaptcha/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.grecaptcha = window.grecaptcha || {};',
    });
  });

  await page.route('**/www.gstatic.com/recaptcha/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  });
}

export async function mockFormspree(page) {
  await page.route('**/formspree.io/**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }
    await route.continue();
  });
}
