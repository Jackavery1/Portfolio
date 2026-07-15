import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoReady, violationsA11y } from './helpers.js';
import { PAGES, VIEWPORTS_A11Y } from './fixtures/responsive.js';

async function preparerPageA11y(page, pageInfo) {
  await gotoReady(page, pageInfo.path);

  if (pageInfo.path === '/contact.html') {
    await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
      timeout: 15_000,
    });
  }

  if (pageInfo.path === '/projets.html') {
    await page.waitForSelector('.grille-projets:not([aria-busy="true"]) .carte-projet', {
      timeout: 15_000,
    });
  }
}

for (const viewport of VIEWPORTS_A11Y) {
  for (const pageInfo of PAGES) {
    test(`a11y ${viewport.label} — ${pageInfo.fichier} sans violation critique`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await preparerPageA11y(page, pageInfo);

      const results = await new AxeBuilder({ page }).analyze();
      expect(violationsA11y(results.violations)).toEqual([]);
    });
  }
}
