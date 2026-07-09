import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoReady, violationsA11y } from './helpers.js';

test('a11y mobile — accueil sans violation critique', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  const results = await new AxeBuilder({ page }).analyze();
  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y mobile — contact sans violation critique', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');
  await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
    timeout: 15_000,
  });

  const results = await new AxeBuilder({ page }).analyze();
  expect(violationsA11y(results.violations)).toEqual([]);
});
