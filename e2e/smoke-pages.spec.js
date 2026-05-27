import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/index.html', titre: /JORIS|MARTINEZ/i },
  { path: '/projets.html', titre: /SELECT|STAGE/i },
  { path: '/competences.html', titre: /HIGH SCORES|ハイスコア/i },
  { path: '/parcours.html', titre: /STORY MODE/i },
  { path: '/contact.html', titre: /CONTINUE|INSERT COIN/i },
  { path: '/dojo.html', titre: /DOJO/i },
  { path: '/mentions-legales.html', titre: /MENTIONS LÉGALES/i },
];

function erreursConsoleBloquantes(erreurs) {
  return erreurs.filter(
    (msg) =>
      !/favicon\.ico/i.test(msg) &&
      !/recaptcha/i.test(msg) &&
      !/Failed to load resource.*404/i.test(msg),
  );
}

for (const { path: pagePath, titre } of PAGES) {
  test(`smoke ${pagePath} — h1 et console`, async ({ page }) => {
    const erreurs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') erreurs.push(msg.text());
    });

    const response = await page.goto(pagePath);
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText(titre);

    expect(erreursConsoleBloquantes(erreurs)).toEqual([]);
  });
}
