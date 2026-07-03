import { test, expect } from '@playwright/test';
import {
  gotoReady,
  lireEntreesPrecache,
  precacheContient,
  preparerServiceWorker,
  assertHauteurTactile,
  assertLargeurTactile,
  simulerInsetHaut,
  simulerInsets,
} from './helpers.js';

const PAGES = [
  { path: '/index.html', h1: /MARTINEZ/i },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
  { path: '/competences.html', h1: /HIGH SCORES/i },
  { path: '/parcours.html', h1: /STORY MODE/i },
  { path: '/contact.html', h1: /CONTINUE/i },
  { path: '/dojo.html', h1: /DOJO/i },
  { path: '/mentions-legales.html', h1: /MENTIONS/i },
];

const VIEWPORTS = [
  { width: 320, height: 568, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
  { width: 961, height: 800, label: 'desktop' },
  { width: 1280, height: 800, label: 'desktop-large' },
  { width: 1920, height: 1080, label: 'desktop-ultrawide' },
];

async function assertPasOverflowHorizontal(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

for (const viewport of VIEWPORTS) {
  for (const pageInfo of PAGES) {
    test(`responsive ${viewport.label} — ${pageInfo.path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoReady(page, pageInfo.path);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText(pageInfo.h1);
      await assertPasOverflowHorizontal(page);

      const viewportMeta = page.locator('meta[name="viewport"]');
      await expect(viewportMeta).toHaveAttribute('content', /viewport-fit=cover/);

      if (pageInfo.path === '/parcours.html') {
        await expect(page.locator('.entree-parcours')).not.toHaveCount(0);
        await expect(page.locator('.svg-arbre')).toBeVisible();
      }
    });
  }
}

test('responsive paysage accueil — scroll et hero visibles', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await gotoReady(page, '/index.html');

  await expect(page.locator('h1')).toContainText(/MARTINEZ/i);
  await expect(page.locator('.accueil__grille')).toBeVisible();
  await assertPasOverflowHorizontal(page);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
  expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
});

test('responsive mobile — cibles tactiles ≥ 44px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/index.html');

  await assertHauteurTactile(page.locator('.nav__burger'));
  await assertLargeurTactile(page.locator('.nav__burger'));
  await assertHauteurTactile(page.locator('.bouton-arcade').first());

  await page.locator('.nav__burger').click({ force: true });
  const liensNav = page.locator('.nav__bouton');
  const nbLiensNav = await liensNav.count();
  for (let i = 0; i < nbLiensNav; i += 1) {
    await assertHauteurTactile(liensNav.nth(i));
  }

  await assertHauteurTactile(page.locator('.pied-page__lien').first());
  await assertHauteurTactile(page.locator('a.pied-page__certif-texte'));

  await gotoReady(page, '/projets.html');
  const liensSommaire = page.locator('.projets-sommaire__liste a');
  const nbSommaire = await liensSommaire.count();
  for (let i = 0; i < nbSommaire; i += 1) {
    await assertHauteurTactile(liensSommaire.nth(i));
    await assertLargeurTactile(liensSommaire.nth(i));
  }

  await gotoReady(page, '/contact.html');
  await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
    timeout: 15_000,
  });
  await assertHauteurTactile(page.locator('.bouton-envoyer'));

  await gotoReady(page, '/dojo.html');
  await assertHauteurTactile(page.locator('.boss-carte').first());

  await gotoReady(page, '/projets.html');
  await page.locator('.carte-projet[data-projet="lsf"]').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await assertHauteurTactile(page.locator('.modal-fermer'));
  await assertLargeurTactile(page.locator('.modal-fermer'));
});

test('safe-area — marquee et nav sans encoche', async ({ page }) => {
  await gotoReady(page, '/index.html');

  const marqueeHeight = await page
    .locator('.marquee-bande')
    .evaluate((el) => getComputedStyle(el).height);
  const navTop = await page.locator('.nav').evaluate((el) => getComputedStyle(el).top);

  expect(marqueeHeight).toBe('32px');
  expect(navTop).toBe('32px');
});

test('safe-area — insets simulés (encoche haut)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page, '/index.html');
  await simulerInsetHaut(page, 20);

  const marqueeHeight = await page
    .locator('.marquee-bande')
    .evaluate((el) => getComputedStyle(el).height);
  const navTop = await page.locator('.nav').evaluate((el) => getComputedStyle(el).top);

  expect(marqueeHeight).toBe('52px');
  expect(navTop).toBe('52px');
});

test('safe-area — inset bas simulé sur contact mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');
  await simulerInsets(page, { bas: 24 });

  const paddingBas = await page
    .locator('body[data-section-id="contact"] .section')
    .evaluate((el) => getComputedStyle(el).paddingBottom);

  expect(paddingBas).toBe('24px');
});

test('desktop — navigation clavier sur tout le menu principal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  const etapes = [
    { path: '/index.html', h1: /MARTINEZ/i },
    { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
    { path: '/competences.html', h1: /HIGH SCORES/i },
    { path: '/parcours.html', h1: /STORY MODE/i },
    { path: '/contact.html', h1: /CONTINUE/i },
  ];

  await gotoReady(page, etapes[0].path);

  for (let i = 1; i < etapes.length; i += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page).toHaveURL(new RegExp(etapes[i].path.replace('.html', '(\\.html)?')));
    await expect(page.locator('h1')).toContainText(etapes[i].h1);
  }

  for (let i = etapes.length - 2; i >= 0; i -= 1) {
    await page.keyboard.press('ArrowLeft');
    await page.waitForSelector('body[data-app-ready="true"]');
    await expect(page).toHaveURL(new RegExp(etapes[i].path.replace('.html', '(\\.html)?')));
    await expect(page.locator('h1')).toContainText(etapes[i].h1);
  }
});

test('desktop-large — liens nav horizontaux ≥ 44px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoReady(page, '/index.html');

  const liens = page.locator('.nav__liens .nav__bouton');
  const nb = await liens.count();
  for (let i = 0; i < nb; i += 1) {
    await assertHauteurTactile(liens.nth(i));
  }
});

test('prefers-reduced-motion — animations désactivées', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoReady(page, '/index.html');

  const marqueeAnim = await page
    .locator('.marquee-contenu')
    .evaluate((el) => getComputedStyle(el).animationName);
  const sectionAnim = await page
    .locator('#accueil.section')
    .evaluate((el) => getComputedStyle(el).animationName);

  expect(marqueeAnim).toBe('none');
  expect(sectionAnim).toBe('none');
});

test('responsive mobile — sommaire projets et 6 cartes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/projets.html');

  await expect(page.locator('.projets-sommaire__liste a')).toHaveCount(6);
  await expect(page.locator('.carte-projet')).toHaveCount(6);
  await expect(page.locator('.carte-projet[data-projet="derniereligne"]')).toBeVisible();
});

test('responsive mobile — scroll contact', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);
  expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
  await assertPasOverflowHorizontal(page);
});

test('responsive mobile étroit — contact et dojo sans overflow (280px)', async ({ page }) => {
  await page.setViewportSize({ width: 280, height: 568 });

  for (const path of ['/contact.html', '/dojo.html']) {
    await gotoReady(page, path);
    await assertPasOverflowHorizontal(page);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('responsive contact — champ message visible après focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await gotoReady(page, '/contact.html');
  await expect(page.locator('#js-formulaire')).toHaveAttribute('data-ready', '1', {
    timeout: 15_000,
  });

  const message = page.locator('#contact-message');
  await message.scrollIntoViewIfNeeded();
  await message.focus();

  const visible = await message.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const vv = window.visualViewport;
    const hauteur = vv?.height ?? window.innerHeight;
    return rect.top >= 0 && rect.bottom <= hauteur + 1;
  });
  expect(visible).toBe(true);
});

test('manifest PWA — présent et valide', async ({ page }) => {
  const response = await page.goto('/manifest.webmanifest');
  expect(response?.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toContain('index.html');
  expect(manifest.icons?.length).toBeGreaterThanOrEqual(3);
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true);
});

test('lien manifest dans le head', async ({ page }) => {
  await gotoReady(page, '/index.html');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    'manifest.webmanifest'
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    /apple-touch-icon\.png/
  );
});

test('page offline — accessible et meta PWA', async ({ page }) => {
  const response = await page.goto('/offline.html');
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('h1')).toContainText(/hors ligne/i);
  await expect(page.locator('a[href="index.html"]')).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    'manifest.webmanifest'
  );
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/
  );
});

test.describe('service worker', () => {
  test.describe.configure({ mode: 'serial' });

  test('precache PWA — offline, previews et volume', async ({ page }) => {
    test.setTimeout(60_000);
    await preparerServiceWorker(page);

    const { urls } = await lireEntreesPrecache(page);
    expect(urls.length).toBeGreaterThanOrEqual(60);
    expect(precacheContient(urls, 'offline.html')).toBe(true);
    expect(
      precacheContient(urls, 'assets/previews/lsf.webp') ||
        precacheContient(urls, 'assets/previews/lsf.png')
    ).toBe(true);
  });

  test('navigation hors ligne — precache et fallback offline.html', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName === 'webkit', 'WebKit : navigation offline instable en CI');
    test.setTimeout(60_000);
    await preparerServiceWorker(page);

    await gotoReady(page, '/projets.html');
    await context.setOffline(true);
    try {
      await page.goto('/projets.html', { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await expect(page.locator('h1')).toContainText(/SELECT YOUR STAGE/i, { timeout: 15_000 });

      const offlinePrecache = await page.evaluate(async () => {
        const keys = await caches.keys();
        const cacheName = keys.find((name) => name.startsWith('portfolio-arcade'));
        if (!cacheName) return null;
        const cache = await caches.open(cacheName);
        const candidates = ['offline.html', '/offline.html', `${location.origin}/offline.html`];
        for (const url of candidates) {
          const match = await cache.match(url);
          if (match) return match.text();
        }
        const requests = await cache.keys();
        const offlineReq = requests.find((req) => req.url.endsWith('/offline.html'));
        return offlineReq ? (await cache.match(offlineReq)).text() : null;
      });
      expect(offlinePrecache).toContain('Mode hors ligne');

      await page.goto('/offline.html', { waitUntil: 'domcontentloaded', timeout: 20_000 });
      await expect(page.locator('h1')).toContainText(/Mode hors ligne/i, { timeout: 15_000 });
      await expect(page.getByRole('link', { name: /accueil/i })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test('enregistré après chargement', async ({ page }) => {
    await gotoReady(page, '/index.html');

    const swUrl = await page.evaluate(async () => {
      const delai = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (let i = 0; i < 150; i += 1) {
        if (!('serviceWorker' in navigator)) return null;
        const registration = await navigator.serviceWorker.getRegistration();
        const url =
          registration?.active?.scriptURL ??
          registration?.installing?.scriptURL ??
          registration?.waiting?.scriptURL ??
          null;
        if (url) return url;
        await delai(200);
      }
      return null;
    });

    expect(swUrl).toContain('sw.js');
  });
});

for (const viewport of [
  { width: 375, height: 667, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
]) {
  test(`responsive ${viewport.label} — burger nav sans overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoReady(page, '/index.html');

    const burger = page.locator('.nav__burger');
    await expect(burger).toBeVisible();
    await burger.click({ force: true });
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#js-menu')).toHaveClass(/ouvert/);
    await expect(page.locator('body')).toHaveClass(/nav-scroll-lock/);
    await assertPasOverflowHorizontal(page);

    await page.keyboard.press('Escape');
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveClass(/nav-scroll-lock/);
  });

  test(`responsive ${viewport.label} — modale projet sans overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoReady(page, '/projets.html');

    const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
    await expect(carte).toBeVisible();
    await carte.click({ force: true });
    await expect(page.locator('#js-modal')).toBeVisible();
    await assertPasOverflowHorizontal(page);
  });
}

test('responsive paysage mobile — modale projet sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/projets.html');

  const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
  await expect(carte).toBeVisible();
  await carte.click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await expect(page.locator('.modal-fermer')).toBeVisible();
  await assertPasOverflowHorizontal(page);
});

test('responsive paysage mobile — compétences sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/competences.html');

  await expect(page.locator('h1')).toContainText(/HIGH SCORES/i);
  await expect(page.locator('.scores-tableau')).toBeVisible();
  await assertPasOverflowHorizontal(page);
});

test('responsive paysage mobile — dojo sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await gotoReady(page, '/dojo.html');

  await expect(page.locator('h1')).toContainText(/DOJO/i);
  await expect(page.locator('.boss-carte').first()).toBeVisible();
  await assertPasOverflowHorizontal(page);
});

test('responsive seuil nav — burger à 960px, liens horizontaux à 961px', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 800 });
  await gotoReady(page, '/index.html');
  await expect(page.locator('.nav__burger')).toBeVisible();
  await expect(page.locator('.nav__liens')).not.toBeVisible();

  await page.setViewportSize({ width: 961, height: 800 });
  await gotoReady(page, '/index.html');
  await expect(page.locator('.nav__burger')).not.toBeVisible();
  await expect(page.locator('.nav__liens')).toBeVisible();
});
