/**
 * E2E toast SW — UI responsive (fixture) + cycle registration `waiting` (prod build).
 */
import { test, expect } from '@playwright/test';
import {
  gotoReady,
  assertHauteurTactile,
  assertLargeurTactile,
  simulerInsets,
  preparerRegistrationSwAvecWorkerEnAttente,
} from './helpers.js';

async function injecterToastFixture(page) {
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
    toast.querySelector('.sw-toast__fermer').addEventListener('click', () => {
      toast.hidden = true;
    });
  });
}

test('toast SW — structure UI accessible (fixture DOM)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');
  await injecterToastFixture(page);

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

test('toast SW — affiché quand registration.waiting (cycle prod)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await preparerRegistrationSwAvecWorkerEnAttente(page);
  await gotoReady(page, '/index.html');

  const toast = page.locator('#js-sw-toast');
  await expect(toast).toBeVisible();
  await expect(toast.locator('.sw-toast__texte')).toContainText(/nouvelle version/i);

  await page.locator('.sw-toast__bouton').click();
  const message = await page.evaluate(() => window.__e2eSkipWaiting);
  expect(message).toEqual({ type: 'SKIP_WAITING' });

  await page.locator('.sw-toast__fermer').click();
  await expect(toast).toBeHidden();
});
