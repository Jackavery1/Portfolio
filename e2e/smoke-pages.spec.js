import { test, expect } from '@playwright/test';
import { PAGES } from './fixtures/pages.js';

function erreursConsoleBloquantes(erreurs) {
  return erreurs.filter(
    (msg) =>
      !/favicon\.ico/i.test(msg) &&
      !/recaptcha/i.test(msg) &&
      !/Failed to load resource.*404/i.test(msg)
  );
}

for (const { path: pagePath, titreSmoke } of PAGES) {
  test(`smoke ${pagePath} — h1 et console`, async ({ page }) => {
    const erreurs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') erreurs.push(msg.text());
    });

    const response = await page.goto(pagePath);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText(titreSmoke);

    expect(erreursConsoleBloquantes(erreurs)).toEqual([]);
  });
}
