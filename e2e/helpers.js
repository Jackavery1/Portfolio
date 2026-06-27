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
