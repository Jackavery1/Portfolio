import { expect } from '@playwright/test';
import { ratioContrasteElementDom } from '../build/contrast-utils.mjs';

export async function gotoReady(page, path) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('body[data-app-ready="true"]', { timeout: 30_000 });
}

/** Navigation page app (data-app-ready) ou page autonome (offline). */
export async function gotoPage(page, path) {
  if (path.includes('offline.html')) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    return;
  }
  await gotoReady(page, path);
}

async function waitForServiceWorker(page) {
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
  expect(box.height).toBeGreaterThanOrEqual(minPx);
}

export async function assertLargeurTactile(locator, minPx = 44) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(minPx);
}

/** Vérifie un ring ou une ombre de focus (pas outline: none seul). */
export async function assertIndicateurFocusVisible(locator) {
  await locator.focus();
  await expect(locator).toBeFocused();
  const styles = await locator.evaluate((el) => {
    const computed = getComputedStyle(el);
    return {
      boxShadow: computed.boxShadow,
      outlineWidth: computed.outlineWidth,
    };
  });
  const ringVisible =
    styles.boxShadow !== 'none' || (styles.outlineWidth !== '0px' && styles.outlineWidth !== '');
  expect(ringVisible).toBe(true);
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
      if (right)
        document.documentElement.style.setProperty('--safe-area-inset-right', `${right}px`);
    },
    { haut, bas, gauche, droite }
  );
}

export async function simulerInsetHaut(page, px = 20) {
  await simulerInsets(page, { haut: px });
}

async function attendrePrecachePwa(page, { minEntrees = 35, timeoutMs = 45_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { urls } = await lireEntreesPrecache(page);
    const precachePret =
      urls.length >= minEntrees &&
      precacheContient(urls, 'offline.html') &&
      precacheContient(urls, 'projets.html') &&
      precacheContient(urls, 'js/main.js');
    if (precachePret) {
      return urls;
    }
    await page.waitForTimeout(200);
  }
  throw new Error('Precache PWA incomplet (offline.html, projets.html ou js/main.js)');
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

export async function preparerRegistrationSwAvecWorkerEnAttente(page) {
  await page.addInitScript(() => {
    const waiting = {
      postMessage: (msg) => {
        window.__e2eSkipWaiting = msg;
      },
    };
    const registration = {
      waiting,
      update: () => Promise.resolve(),
      addEventListener: () => {},
    };
    navigator.serviceWorker.register = () => Promise.resolve(registration);
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      get: () => ({}),
      configurable: true,
    });
  });
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

/** Filtre les violations Axe critiques, sérieuses ou modérées. */
export function violationsA11y(violations) {
  return violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate'
  );
}

/** Ignore les erreurs console connues (favicon, reCAPTCHA, 404 mineurs). */
export function erreursConsoleBloquantes(erreurs) {
  return erreurs.filter(
    (msg) =>
      !/favicon\.ico/i.test(msg) &&
      !/recaptcha/i.test(msg) &&
      !/Failed to load resource.*404/i.test(msg)
  );
}

/** Ratio de contraste WCAG (luminance relative) entre le texte et le fond effectif d'un élément. */
export async function ratioContrasteElement(locator) {
  return locator.first().evaluate(ratioContrasteElementDom);
}

export async function assertContrasteAa(locator, minRatio = 4.5) {
  const ratio = await ratioContrasteElement(locator);
  expect(ratio).toBeGreaterThanOrEqual(minRatio);
}
