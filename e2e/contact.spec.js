import { test, expect } from '@playwright/test';
import { mockFormspree, mockRecaptcha } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await mockRecaptcha(page);
  await mockFormspree(page);
});

test('formulaire contact — envoi mocké Formspree', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('#js-formulaire')).toBeVisible();

  await page.evaluate(() => {
    const nom = document.querySelector('#contact-nom');
    const email = document.querySelector('#contact-email');
    const sujet = document.querySelector('#contact-sujet');
    const message = document.querySelector('#contact-message');
    if (!nom || !email || !sujet || !message) return;

    nom.value = 'Test E2E';
    email.value = 'e2e@example.com';
    sujet.value = 'stage';
    message.value = 'Message de test automatisé Playwright.';

    [nom, email, sujet, message].forEach((el) => {
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  await expect(page.locator('#js-btn-envoyer')).toBeEnabled();
  await page.locator('#js-btn-envoyer').click();

  await expect(page.locator('#js-confirmation')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#js-btn-envoyer')).toHaveText(/ENVOYÉ/i);
});
