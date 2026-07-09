/**
 * E2E toast SW — structure DOM/CSS accessible (pas de simulation worker `waiting` en prod).
 */
import { test, expect } from '@playwright/test';
import {
  gotoReady,
  assertHauteurTactile,
  assertLargeurTactile,
  simulerInsets,
} from './helpers.js';

test('toast SW — structure UI accessible (fixture DOM, hors cycle SW)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  await page.evaluate(() => {
    if (document.getElementById('js-sw-toast')) return;
    const toast = document.createElement('div');
    toast.id = 'js-sw-toast';
    toast.className = 'sw-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <p class="sw-toast__texte">Nouvelle version disponible.</p>
      <div class="sw-toast__actions">
        <button type="button" class="sw-toast__bouton bouton-arcade">Actualiser</button>
        <button type="button" class="sw-toast__fermer" aria-label="Fermer la notification">×</button>
      </div>
    `;
    document.body.appendChild(toast);
    toast.hidden = false;
  });

  const toast = page.locator('#js-sw-toast');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('role', 'status');
  await expect(toast).toHaveAttribute('aria-live', 'polite');

  await assertHauteurTactile(page.locator('.sw-toast__bouton'));
  await assertLargeurTactile(page.locator('.sw-toast__fermer'));

  await simulerInsets(page, { bas: 24 });
  const bottom = await toast.evaluate((el) => getComputedStyle(el).bottom);
  expect(bottom).not.toBe('0px');

  await page.locator('.sw-toast__fermer').click();
  await expect(toast).toBeHidden();
});
