import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';

test('clavier mobile — burger et fermeture Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  await page.keyboard.press('Tab');
  const burger = page.locator('.nav__burger');
  await expect(burger).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(burger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#js-menu')).toHaveClass(/ouvert/);

  await page.keyboard.press('Escape');
  await expect(burger).toHaveAttribute('aria-expanded', 'false');
});

test('clavier mobile — modale projet fermable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/projets.html');

  await page.locator('.carte-projet').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('#js-modal')).toBeHidden();
});
