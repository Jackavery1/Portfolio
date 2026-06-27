import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/index.html', h1: /MARTINEZ/i },
  { path: '/contact.html', h1: /CONTINUE/i },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
];

const VIEWPORTS = [
  { width: 320, height: 568, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
  { width: 961, height: 800, label: 'desktop' },
];

for (const viewport of VIEWPORTS) {
  for (const pageInfo of PAGES) {
    test(`responsive ${viewport.label} — ${pageInfo.path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pageInfo.path);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText(pageInfo.h1);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
}

test('responsive mobile — sommaire projets et 6 cartes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/projets.html');

  await expect(page.locator('.projets-sommaire__liste a')).toHaveCount(6);
  await expect(page.locator('.carte-projet')).toHaveCount(6);
  await expect(page.locator('.carte-projet[data-projet="derniereligne"]')).toBeVisible();
});
