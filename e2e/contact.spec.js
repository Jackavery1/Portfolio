import { test, expect } from '@playwright/test';
import { gotoReady, mockFormspree, mockRecaptcha } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await mockRecaptcha(page);
  await mockFormspree(page);
});

test('formulaire contact — envoi mocké Formspree', async ({ page }) => {
  test.setTimeout(45_000);

  await gotoReady(page, '/contact.html');
  await page.evaluate(() => sessionStorage.clear());

  const formulaire = page.locator('#js-formulaire');
  await formulaire.scrollIntoViewIfNeeded();
  await expect(formulaire).toBeVisible();
  await expect(formulaire).toHaveAttribute('data-ready', '1', { timeout: 15_000 });

  await formulaire.locator('#contact-nom').fill('Test E2E');
  await formulaire.locator('#contact-email').fill('e2e@example.com');
  await formulaire.locator('#contact-sujet').selectOption('stage');
  await formulaire.locator('#contact-message').fill('Message de test automatisé Playwright.');

  await expect(formulaire.locator('#contact-nom')).toHaveValue('Test E2E');
  await expect(formulaire.locator('#contact-sujet')).toHaveValue('stage');

  await expect(page.locator('#js-btn-envoyer')).toBeEnabled();

  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('formspree.io') && res.request().method() === 'POST',
    ),
    page.locator('#js-btn-envoyer').click(),
  ]);

  await expect(page.locator('#js-confirmation')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#js-btn-envoyer')).toHaveText(/ENVOYÉ/i);
});

test('contact mobile — formulaire accessible après scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');
  await expect(page.locator('h1')).toBeVisible();

  const formulaire = page.locator('#js-formulaire');
  await formulaire.scrollIntoViewIfNeeded();
  await expect(formulaire).toBeVisible();
  await expect(formulaire.locator('#contact-nom')).toBeVisible();
});
