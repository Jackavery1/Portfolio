export async function mockRecaptcha(page) {
  // Mock stable injecté avant tout script de page.
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
  await page.addInitScript(() => {
    const fetchOrigine = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      if (url.includes('formspree.io')) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return fetchOrigine(input, init);
    };
  });

  await page.route('**/formspree.io/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}
