import { test, expect } from '@playwright/test';

test('page dojo charge sans erreur console critique', async ({ page }) => {
  const erreurs = [];
  page.on('pageerror', (err) => erreurs.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') erreurs.push(msg.text());
  });

  await page.goto('/dojo.html');

  await expect(page.locator('h1.titre-section')).toContainText(/DOJO/i);
  await expect(page.locator('.boss-rush .boss-carte').first()).toBeVisible();

  const bloquantes = erreurs.filter((e) => !/favicon|recaptcha|Failed to load resource/i.test(e));
  expect(bloquantes).toEqual([]);
});
