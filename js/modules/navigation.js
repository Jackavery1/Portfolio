/* ============================================
   Navigation : burger + flèches entre pages
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { trapTabModal } from '../utils/focus.js';
import { indexDansOrdreNavigation, libellerPageNavigation } from '../utils/navigation-helpers.js';
import { jouerBip } from './audio.js';

export function fermerMenuBurger() {
  const burger = byId(CONFIG.SELECTORS.BURGER);
  const menuNav = byId(CONFIG.SELECTORS.MENU);
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Ouvrir le menu');
  if (menuNav) menuNav.classList.remove('ouvert');
  document.body.classList.remove('nav-scroll-lock');
}

function setMenuOuvert(ouvert) {
  document.body.classList.toggle('nav-scroll-lock', ouvert);
}

function focusPremierLienMenu(menuNav) {
  const lien = menuNav?.querySelector('.nav__bouton');
  lien?.focus();
}

function indexNavigationClavier() {
  return indexDansOrdreNavigation(window.location.pathname, CONFIG.NAVIGATION.ORDER);
}

export function initNavigationArcade() {
  const burger = byId(CONFIG.SELECTORS.BURGER);
  const menuNav = byId(CONFIG.SELECTORS.MENU);
  if (!burger || !menuNav) return;

  burger.addEventListener('click', () => {
    const estOuvert = burger.getAttribute('aria-expanded') === 'true';
    const ouvre = !estOuvert;
    burger.setAttribute('aria-expanded', String(ouvre));
    burger.setAttribute('aria-label', ouvre ? 'Fermer le menu' : 'Ouvrir le menu');
    menuNav.classList.toggle('ouvert', ouvre);
    setMenuOuvert(ouvre);
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
    if (nav) trapTabModal(evt, nav);
  });
}

function enregistrerAnnonceNavigation(fichier) {
  try {
    sessionStorage.setItem(
      CONFIG.STORAGE.NAV_CLAVIER_ANNONCE,
      libellerPageNavigation(fichier)
    );
  } catch {
    /* sessionStorage indisponible */
  }
}

export function annoncerNavigationClavier() {
  try {
    const libelle = sessionStorage.getItem(CONFIG.STORAGE.NAV_CLAVIER_ANNONCE);
    if (!libelle) return;
    sessionStorage.removeItem(CONFIG.STORAGE.NAV_CLAVIER_ANNONCE);
    const zone = byId('js-annonce-navigation');
    if (zone) zone.textContent = `Page ${libelle}`;
  } catch {
    /* sessionStorage indisponible */
  }
}

export function initNavigationClavier() {
  document.addEventListener('keydown', (evt) => {
    const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
    if (modalOverlay && !modalOverlay.hidden) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    const menuNav = byId(CONFIG.SELECTORS.MENU);
    if (menuNav?.classList.contains('ouvert')) return;
    const idx = indexNavigationClavier();
    if (idx < 0) return;
    const ordre = CONFIG.NAVIGATION.ORDER;
    if (evt.key === 'ArrowRight' && idx < ordre.length - 1) {
      jouerBip(440, 40);
      enregistrerAnnonceNavigation(ordre[idx + 1]);
      window.location.href = ordre[idx + 1];
    }
    if (evt.key === 'ArrowLeft' && idx > 0) {
      jouerBip(330, 40);
      enregistrerAnnonceNavigation(ordre[idx - 1]);
      window.location.href = ordre[idx - 1];
    }
  });
}
