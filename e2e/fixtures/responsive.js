import { expect } from '@playwright/test';
import { PAGES, pagesNavigationClavier } from './pages.js';

export { PAGES };

/** Coquille layout — testée à chaque viewport (évite la matrice complète pages × viewports). */
export const PAGE_COQUILLE = PAGES[0];

/** Pages étendues en tablette/desktop (matrice allégée mais > accueil seul). */
export const PAGES_COQUILLE_ETENDUES = PAGES.slice(1);

/** Viewports représentatifs (mobile, tablette, desktop, large). */
export const VIEWPORTS = [
  { width: 375, height: 667, label: 'mobile-compact' },
  { width: 768, height: 1024, label: 'tablette' },
  { width: 961, height: 800, label: 'desktop' },
  { width: 1280, height: 800, label: 'desktop-large' },
];

/** Viewports tablette, desktop et desktop-large pour la matrice étendue. */
export const VIEWPORTS_ETENDUS = VIEWPORTS.slice(1);

/** Viewport étroit — aligné sur build/breakpoints.mjs (MOBILE_ETROIT_MAX). */
export const VIEWPORT_ETROIT = { width: 320, height: 568, label: 'mobile-etroit' };

/** Référence mobile unique pour scénarios ciblés (burger, touch, contact). */
export const VIEWPORT_MOBILE = VIEWPORTS[0];

/** Paysage standard — rotation VIEWPORT_MOBILE, aligné playwright.config.js */
export const VIEWPORT_PAYSAGE = {
  width: VIEWPORT_MOBILE.height,
  height: VIEWPORT_MOBILE.width,
  label: 'mobile-paysage',
};

/** Paysage étroit — rotation VIEWPORT_ETROIT (320px de hauteur, cas le plus contraint) */
export const VIEWPORT_ETROIT_PAYSAGE = {
  width: VIEWPORT_ETROIT.height,
  height: VIEWPORT_ETROIT.width,
  label: 'mobile-etroit-paysage',
};

export const VIEWPORTS_BURGER = [VIEWPORT_MOBILE, VIEWPORTS[1]];

/** Viewports pour audits axe (mobile, tablette, desktop-large). */
export const VIEWPORTS_A11Y = [VIEWPORTS[0], VIEWPORTS[1], VIEWPORTS[3]];

/** Viewport Lighthouse CI mobile (lighthouserc.cjs). */
export const VIEWPORT_LHCI = { width: 412, height: 823, label: 'lhci-mobile' };

export const NAVIGATION_CLAVIER = pagesNavigationClavier();

/** Séquence Konami — alignée sur js/config/konami.js */
export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export async function assertPasOverflowHorizontal(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

/** Applique zoom 200 % et vérifie l’absence de scroll horizontal (WCAG reflow). */
export async function assertZoom200SansOverflow(page, { visible } = {}) {
  if (visible) {
    await expect(page.locator(visible).first()).toBeVisible();
  }

  await page.evaluate(() => {
    document.documentElement.style.zoom = '200%';
  });

  await assertPasOverflowHorizontal(page);

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(hasHorizontalScroll).toBe(false);
}
