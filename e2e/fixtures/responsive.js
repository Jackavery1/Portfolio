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

export const VIEWPORTS_BURGER = [VIEWPORT_MOBILE, VIEWPORTS[1]];

export const NAVIGATION_CLAVIER = pagesNavigationClavier();

export async function assertPasOverflowHorizontal(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}
