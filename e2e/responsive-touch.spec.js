import { test, expect } from '@playwright/test';
import { gotoReady, gotoPage, assertHauteurTactile, assertLargeurTactile } from './helpers.js';
import { VIEWPORT_ETROIT, VIEWPORT_MOBILE, VIEWPORT_PAYSAGE } from './fixtures/responsive.js';

const CIBLES_ETROITES = [
  {
    path: '/index.html',
    cibles: ['.nav__burger', '.nav__musique', '.bouton-arcade', '.lien-evitement'],
  },
  {
    path: '/projets.html',
    cibles: ['.projets-sommaire__liste a', '.carte-projet'],
    modale: true,
  },
  {
    path: '/contact.html',
    ready: '#js-formulaire',
    cibles: ['.bouton-envoyer'],
  },
  {
    path: '/mentions-legales.html',
    cibles: ['.mentions-sommaire__liste a'],
  },
  {
    path: '/parcours.html',
    cibles: ['.entree-parcours'],
  },
  {
    path: '/dojo.html',
    cibles: ['.boss-carte'],
  },
  {
    path: '/competences.html',
    cibles: ['.scores-tableau-zone'],
  },
];

test('responsive mobile étroit — cibles tactiles ≥ 44px', async ({ page }) => {
  await page.setViewportSize(VIEWPORT_ETROIT);

  for (const pageInfo of CIBLES_ETROITES) {
    await gotoReady(page, pageInfo.path);
    if (pageInfo.ready) {
      await expect(page.locator(pageInfo.ready)).toHaveAttribute('data-ready', '1', {
        timeout: 15_000,
      });
    }

    for (const selecteur of pageInfo.cibles) {
      const cible = page.locator(selecteur).first();
      await assertHauteurTactile(cible);
      if (selecteur.includes('sommaire') || selecteur.includes('carte-projet')) {
        await assertLargeurTactile(cible);
      }
    }

    if (pageInfo.modale) {
      await page.locator('.carte-projet').first().click({ force: true });
      await expect(page.locator('#js-modal')).toBeVisible();
      await assertHauteurTactile(page.locator('.modal-fermer'));
      await assertLargeurTactile(page.locator('.modal-fermer'));
    }
  }

  await gotoReady(page, '/index.html');
  await page.locator('.nav__burger').click({ force: true });
  const liensNav = page.locator('.nav__bouton');
  const nbLiensNav = await liensNav.count();
  for (let i = 0; i < nbLiensNav; i += 1) {
    await assertHauteurTactile(liensNav.nth(i));
  }
});

test('responsive mobile — cibles tactiles ≥ 44px', async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);
  await gotoReady(page, '/index.html');

  await assertHauteurTactile(page.locator('.nav__burger'));
  await assertLargeurTactile(page.locator('.nav__burger'));
  await assertHauteurTactile(page.locator('.nav__musique'));
  await assertLargeurTactile(page.locator('.nav__musique'));
  await assertHauteurTactile(page.locator('.bouton-arcade').first());

  await page.locator('.nav__burger').click({ force: true });
  const liensNav = page.locator('.nav__bouton');
  const nbLiensNav = await liensNav.count();
  for (let i = 0; i < nbLiensNav; i += 1) {
    await assertHauteurTactile(liensNav.nth(i));
  }

  await assertHauteurTactile(page.locator('.pied-page__lien').first());
  await assertHauteurTactile(page.locator('a.pied-page__certif-texte'));
  await assertHauteurTactile(page.locator('a.pied-page__lien[href*="mentions-legales"]').first());

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
  await assertHauteurTactile(page.locator('.contact-bandeau__action'));

  await gotoPage(page, '/offline.html');
  await assertHauteurTactile(page.locator('.offline-ecran a[href="index.html"]'));

  await gotoReady(page, '/index.html');
  await page.evaluate(() => {
    const popup = document.getElementById('js-popup-hs');
    if (popup) popup.hidden = false;
  });
  await expect(page.locator('#js-popup-hs')).toBeVisible();
  await assertHauteurTactile(page.locator('.popup-highscore__btn'));
  await assertHauteurTactile(page.locator('.popup-highscore__fermer'));

  await gotoReady(page, '/dojo.html');
  await assertHauteurTactile(page.locator('.boss-carte').first());

  await gotoReady(page, '/parcours.html');
  await assertHauteurTactile(page.locator('.entree-parcours').first());

  await gotoReady(page, '/mentions-legales.html');
  const liensMentions = page.locator('.mentions-sommaire__liste a');
  const nbMentions = await liensMentions.count();
  for (let i = 0; i < nbMentions; i += 1) {
    await assertHauteurTactile(liensMentions.nth(i));
    await assertLargeurTactile(liensMentions.nth(i));
  }

  await gotoReady(page, '/competences.html');
  await assertHauteurTactile(page.locator('.scores-tableau-zone'));

  await gotoReady(page, '/index.html');
  await assertHauteurTactile(page.locator('.lien-evitement'));

  await gotoReady(page, '/projets.html');
  await page.locator('.carte-projet[data-projet="lsf"]').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await assertHauteurTactile(page.locator('.modal-fermer'));
  await assertLargeurTactile(page.locator('.modal-fermer'));
});

test('touch paysage — burger et fermeture modale ≥ 44px', async ({ page }) => {
  await page.setViewportSize(VIEWPORT_PAYSAGE);
  await gotoReady(page, '/index.html');

  await assertHauteurTactile(page.locator('.nav__burger'));
  await assertLargeurTactile(page.locator('.nav__burger'));

  await page.locator('.nav__burger').click({ force: true });
  const liensNav = page.locator('.nav__bouton');
  const nbLiensNav = await liensNav.count();
  for (let i = 0; i < nbLiensNav; i += 1) {
    await assertHauteurTactile(liensNav.nth(i));
  }

  await gotoReady(page, '/projets.html');
  await page.locator('.carte-projet').first().click({ force: true });
  await expect(page.locator('#js-modal')).toBeVisible();
  await assertHauteurTactile(page.locator('.modal-fermer'));
  await assertLargeurTactile(page.locator('.modal-fermer'));
});

test('touch mobile — bouton musique bascule data-etat', async ({ page }) => {
  await page.setViewportSize(VIEWPORT_MOBILE);
  await gotoReady(page, '/index.html');
  await page.evaluate(() => localStorage.removeItem('portfolio_musique_active'));

  const musique = page.locator('.nav__musique');
  const etatInitial = await musique.getAttribute('data-etat');
  await musique.click();
  await expect(musique).not.toHaveAttribute('data-etat', etatInitial);
  await musique.click();
  await expect(musique).toHaveAttribute('data-etat', etatInitial);
});

test('desktop-large — coquille accueil sans overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoReady(page, '/index.html');

  await expect(page.locator('.nav__liens')).toBeVisible();
  await expect(page.locator('.nav__burger')).not.toBeVisible();

  const liens = page.locator('.nav__liens .nav__bouton');
  const nb = await liens.count();
  for (let i = 0; i < nb; i += 1) {
    await assertHauteurTactile(liens.nth(i));
  }
});
