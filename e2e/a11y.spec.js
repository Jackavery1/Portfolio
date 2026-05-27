import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ mode: 'serial' });

function violationsCritiques(violations) {
  return violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

test('a11y contact — pas de violation critique', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .exclude('#js-recaptcha-mount')
    .analyze();

  expect(violationsCritiques(results.violations)).toEqual([]);
});

test('a11y navigation modale projets — pas de violation critique', async ({ page }) => {
  await page.goto('/projets.html');
  const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
  await expect(carte).toBeVisible();
  await carte.click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('#js-modal')
    .analyze();

  expect(violationsCritiques(results.violations)).toEqual([]);
});
