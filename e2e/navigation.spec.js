import { test, expect } from '@playwright/test';
import { gotoReady } from './helpers.js';

test('accueil → projets → modale → Escape', async ({ page }) => {
  await gotoReady(page, '/index.html');
  await expect(page.locator('#js-score')).toBeVisible();

  await page.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: 'WORK' }).click();
  await expect(page).toHaveURL(/\/projets(\.html)?$/);
  await page.waitForSelector('body[data-app-ready="true"]');
  await expect(page.locator('h1.titre-section')).toContainText(/SELECT YOUR STAGE/i);

  const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
  await expect(carte).toBeVisible();
  const modal = page.locator('#js-modal');
  await expect
    .poll(
      async () => {
        await carte.click({ force: true });
        return modal.isVisible();
      },
      { timeout: 15_000 }
    )
    .toBe(true);
  await expect(page.locator('#js-modal-titre')).not.toHaveText('NOM DU PROJET');
  const apercu = page.locator('#js-modal-img');
  await expect(apercu).toBeVisible();
  await expect
    .poll(async () => apercu.evaluate((img) => img.naturalWidth > 0), {
      timeout: 10_000,
    })
    .toBe(true);

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});
