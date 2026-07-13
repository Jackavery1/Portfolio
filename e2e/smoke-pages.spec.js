import { test, expect } from '@playwright/test';
import { erreursConsoleBloquantes } from './helpers.js';
import { PAGES } from './fixtures/pages.js';

for (const { path: pagePath, titreSmoke } of PAGES) {
  test(`smoke ${pagePath} — h1 et console`, async ({ page }) => {
    const erreurs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') erreurs.push(msg.text());
    });

    const response = await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText(titreSmoke);

    expect(erreursConsoleBloquantes(erreurs)).toEqual([]);
  });
}
