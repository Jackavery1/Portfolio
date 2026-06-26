import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ mode: 'serial' });

function violationsA11y(violations) {
  return violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate',
  );
}

test('a11y accueil — pas de violation critique', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y compétences — pas de violation critique', async ({ page }) => {
  await page.goto('/competences.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y dojo — pas de violation critique', async ({ page }) => {
  await page.goto('/dojo.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y parcours — pas de violation critique', async ({ page }) => {
  await page.goto('/parcours.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y menu burger mobile — pas de violation critique', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/index.html');
  const burger = page.locator('.nav__burger');
  await expect(burger).toBeVisible();
  await burger.click();
  await expect(page.locator('.nav__liens.ouvert')).toBeVisible();

  const results = await new AxeBuilder({ page }).include('header.nav').analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y contact — pas de violation critique', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .exclude('#js-recaptcha-mount')
    .analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y mentions légales — email hydraté, pas de violation critique', async ({ page }) => {
  await page.goto('/mentions-legales.html');
  await expect(page.locator('h1')).toBeVisible();

  const email = page.locator('#js-mentions-email');
  await expect(email).toBeVisible();
  await expect(email).not.toHaveText('Chargement…');

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y projets page entière — pas de violation critique', async ({ page }) => {
  await page.goto('/projets.html');
  await expect(page.locator('h1')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});

test('a11y navigation modale projets — pas de violation critique', async ({ page }) => {
  await page.goto('/projets.html');
  const carte = page.locator('.carte-projet[data-projet="lsf"]').first();
  await expect(carte).toBeVisible();
  await carte.click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('#js-modal')
    .analyze();

  expect(violationsA11y(results.violations)).toEqual([]);
});
