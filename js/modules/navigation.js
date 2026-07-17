/* ============================================
   Navigation : burger + flèches entre pages
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { piegerTabulationModale } from '../utils/focus.js';
import { prefixeKonamiActif } from '../utils/konami-buffer.js';
import { indexDansOrdreNavigation, libellerPageNavigation } from '../utils/navigation-helpers.js';
import { jouerBip } from './audio.js';

function fermerMenuBurger() {
  const burger = parId(CONFIGURATION.SELECTEURS.BURGER);
  const menuNav = parId(CONFIGURATION.SELECTEURS.MENU);
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Ouvrir le menu');
  if (menuNav) menuNav.classList.remove('ouvert');
  document.body.classList.remove('nav-scroll-lock');
}

function definirMenuOuvert(ouvert) {
  document.body.classList.toggle('nav-scroll-lock', ouvert);
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
    definirMenuOuvert(ouvre);
    if (ouvre) focusPremierLienMenu(menuNav);
    jouerBip(estOuvert ? 220 : 330, 40);
  });

  document.addEventListener('click', (evt) => {
    if (!burger.contains(evt.target) && !menuNav.contains(evt.target)) {
      fermerMenuBurger();
    }
  });

  document.addEventListener('keydown', (evt) => {
    if (!menuNav.classList.contains('ouvert')) return;
    if (evt.key === 'Escape') {
      fermerMenuBurger();
      burger.focus();
      return;
    }
    const nav = menuNav.closest('.nav');
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
