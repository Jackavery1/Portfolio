import { expect } from '@playwright/test';

export const PAGES = [
  { path: '/index.html', h1: /MARTINEZ/i },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
  { path: '/competences.html', h1: /HIGH SCORES/i },
  { path: '/parcours.html', h1: /STORY MODE/i },
  { path: '/contact.html', h1: /CONTINUE/i },
  { path: '/dojo.html', h1: /DOJO/i },
  { path: '/mentions-legales.html', h1: /MENTIONS/i },
];

export const VIEWPORTS = [
  { width: 320, height: 568, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
  { width: 961, height: 800, label: 'desktop' },
  { width: 1280, height: 800, label: 'desktop-large' },
  { width: 1920, height: 1080, label: 'desktop-ultrawide' },
];

export const VIEWPORTS_BURGER = [
  { width: 375, height: 667, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablette' },
];

export const NAVIGATION_CLAVIER = [
  { path: '/index.html', h1: /MARTINEZ/i },
  { path: '/projets.html', h1: /SELECT YOUR STAGE/i },
  { path: '/competences.html', h1: /HIGH SCORES/i },
  { path: '/parcours.html', h1: /STORY MODE/i },
  { path: '/contact.html', h1: /CONTINUE/i },
];

export async function assertPasOverflowHorizontal(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}
