/* ============================================
   Navigation : burger + flèches entre pages
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { piegerTabulationModale } from '../utils/focus.js';
import { basculerInertFond } from '../utils/inert.js';
import { prefixeKonamiActif } from '../utils/konami-buffer.js';
import { indexDansOrdreNavigation, libellerPageNavigation } from '../utils/navigation-helpers.js';
import { jouerBip } from './audio.js';

function contenusSousEcran(menuNav) {
  const ecran = menuNav?.closest('.ecran');
  if (!ecran) return { ecran: null, contenus: [] };
  return {
    ecran,
    contenus: [...ecran.querySelectorAll(':scope > main, :scope > footer')],
  };
}

function definirMenuOuvert(ouvert, menuNav) {
  document.body.classList.toggle('nav-scroll-lock', ouvert);
  const { ecran, contenus } = contenusSousEcran(menuNav);
  if (ecran) basculerInertFond(ouvert, ecran);
  contenus.forEach((el) => {
    if (ouvert) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}

function fermerMenuBurger() {
  const burger = parId(CONFIGURATION.SELECTEURS.BURGER);
  const menuNav = parId(CONFIGURATION.SELECTEURS.MENU);
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Ouvrir le menu');
  if (menuNav) menuNav.classList.remove('ouvert');
  definirMenuOuvert(false, menuNav);
}

function focusPremierLienMenu(menuNav) {
  const lien = menuNav?.querySelector('.nav__bouton');
  lien?.focus();
}

function indexNavigationClavier() {
  return indexDansOrdreNavigation(window.location.pathname, CONFIGURATION.NAVIGATION.ORDRE);
}

export function initialiserNavigationArcade() {
  const burger = parId(CONFIGURATION.SELECTEURS.BURGER);
  const menuNav = parId(CONFIGURATION.SELECTEURS.MENU);
  if (!burger || !menuNav || burger.dataset.navArcade) return;
  burger.dataset.navArcade = '1';

  burger.addEventListener('click', () => {
    const estOuvert = burger.getAttribute('aria-expanded') === 'true';
    const ouvre = !estOuvert;
    burger.setAttribute('aria-expanded', String(ouvre));
    burger.setAttribute('aria-label', ouvre ? 'Fermer le menu' : 'Ouvrir le menu');
    menuNav.classList.toggle('ouvert', ouvre);
    definirMenuOuvert(ouvre, menuNav);
    if (ouvre) focusPremierLienMenu(menuNav);
    jouerBip(estOuvert ? 220 : 330, 40);
  });

  if (document.documentElement.dataset.navArcadeDoc) return;
  document.documentElement.dataset.navArcadeDoc = '1';

  document.addEventListener('click', (evt) => {
    const b = parId(CONFIGURATION.SELECTEURS.BURGER);
    const m = parId(CONFIGURATION.SELECTEURS.MENU);
    if (!b || !m) return;
    if (!b.contains(evt.target) && !m.contains(evt.target)) {
      fermerMenuBurger();
    }
  });

  document.addEventListener('keydown', (evt) => {
    const m = parId(CONFIGURATION.SELECTEURS.MENU);
    const b = parId(CONFIGURATION.SELECTEURS.BURGER);
    if (!m?.classList.contains('ouvert')) return;
    if (evt.key === 'Escape') {
      fermerMenuBurger();
      b?.focus();
      return;
    }
    const nav = m.closest('.nav');
    if (nav) piegerTabulationModale(evt, nav);
  });
}

function enregistrerAnnonceNavigation(fichier) {
  try {
    sessionStorage.setItem(
      CONFIGURATION.STOCKAGE.ANNONCE_NAV_CLAVIER,
      libellerPageNavigation(fichier)
    );
  } catch {
    /* sessionStorage indisponible */
  }
}

export function annoncerNavigationClavier() {
  try {
    const libelle = sessionStorage.getItem(CONFIGURATION.STOCKAGE.ANNONCE_NAV_CLAVIER);
    if (!libelle) return;
    sessionStorage.removeItem(CONFIGURATION.STOCKAGE.ANNONCE_NAV_CLAVIER);
    const zone = parId('js-annonce-navigation');
    if (zone) zone.textContent = `Page ${libelle}`;
  } catch {
    /* sessionStorage indisponible */
  }
}

function navigationClavierBloquee() {
  const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
  if (modalOverlay && !modalOverlay.hidden) return true;
  const popupHs = parId(CONFIGURATION.SELECTEURS.POPUP_HS);
  if (popupHs && !popupHs.hidden) return true;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return true;
  const menuNav = parId(CONFIGURATION.SELECTEURS.MENU);
  return Boolean(menuNav?.classList.contains('ouvert'));
}

function allerPageVoisine(delta) {
  const idx = indexNavigationClavier();
  if (idx < 0) return;
  const ordre = CONFIGURATION.NAVIGATION.ORDRE;
  const cible = idx + delta;
  if (cible < 0 || cible >= ordre.length) return;
  if (prefixeKonamiActif()) return;
  jouerBip(delta > 0 ? 440 : 330, 40);
  enregistrerAnnonceNavigation(ordre[cible]);
  window.location.href = ordre[cible];
}

export function initialiserNavigationClavier() {
  if (document.documentElement.dataset.navClavier) return;
  document.documentElement.dataset.navClavier = '1';

  document.addEventListener('keydown', (evt) => {
    if (navigationClavierBloquee()) return;
    if (evt.key === 'ArrowRight') {
      evt.preventDefault();
      allerPageVoisine(1);
    } else if (evt.key === 'ArrowLeft') {
      evt.preventDefault();
      allerPageVoisine(-1);
    }
  });
}
