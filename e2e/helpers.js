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
          registration?.waiting?.scriptURL,
      );
    },
    undefined,
    { timeout: 20_000 },
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
