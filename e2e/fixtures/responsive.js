import { expect } from '@playwright/test';
import { pagesNavigationClavier } from './navigation-menu.js';

export const PAGES = [
  { path: '/index.html', h1: /MARTINEZ/i },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
  { path: '/competences.html', h1: /HIGH SCORES/i },
  { path: '/parcours.html', h1: /STORY MODE/i },
  { path: '/contact.html', h1: /CONTINUE/i },
  { path: '/dojo.html', h1: /DOJO/i },
  { path: '/mentions-legales.html', h1: /MENTIONS/i },
];

/** Coquille layout — testée à chaque viewport (évite la matrice complète pages × viewports). */
export const PAGE_COQUILLE = PAGES[0];

/** Pages étendues en tablette/desktop (matrice allégée mais > accueil seul). */
export const PAGES_COQUILLE_ETENDUES = [PAGES[1], PAGES[4]];

/** Viewports représentatifs (mobile, tablette, desktop, large). */
export const VIEWPORTS = [
  { width: 375, height: 667, label: 'mobile-compact' },
  { width: 768, height: 1024, label: 'tablette' },
  { width: 961, height: 800, label: 'desktop' },
  { width: 1280, height: 800, label: 'desktop-large' },
];

/** Viewports tablette + desktop pour la matrice étendue. */
export const VIEWPORTS_ETENDUS = VIEWPORTS.slice(1, 3);

/** Viewport étroit — aligné sur build/breakpoints.cjs (MOBILE_ETROIT_MAX). */
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
