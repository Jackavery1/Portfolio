import { test, expect } from '@playwright/test';

test('accueil → projets → modale → Escape', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('#js-score')).toBeVisible();

  await page.getByRole('navigation', { name: 'Pages' }).getByRole('link', { name: 'WORK' }).click();
  await expect(page).toHaveURL(/\/projets(\.html)?$/);
  await expect(page.locator('h1.titre-section')).toContainText(/SELECT YOUR STAGE/i);

  const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
  await expect(carte).toBeVisible();
  const modal = page.locator('#js-modal');
  await expect
    .poll(async () => {
      await carte.click({ force: true });
      return modal.isVisible();
    }, { timeout: 15_000 })
    .toBe(true);
  await expect(page.locator('#js-modal-titre')).not.toHaveText('NOM DU PROJET');

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});
