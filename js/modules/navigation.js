/* ============================================
   Navigation : burger + flèches entre pages
   ============================================ */

import { CONFIG } from '../config.js';
import { byId } from '../utils/dom.js';
import { jouerBip } from './audio.js';

export function fermerMenuBurger() {
  const burger = byId(CONFIG.SELECTORS.BURGER);
  const menuNav = byId(CONFIG.SELECTORS.MENU);
  if (!burger) return;
  burger.setAttribute('aria-expanded', 'false');
  if (menuNav) menuNav.classList.remove('ouvert');
}

export function indexNavigationClavier() {
  const file = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0].toLowerCase();
  return CONFIG.NAVIGATION.ORDER.indexOf(file);
}

export function initNavigationArcade() {
  const burger = byId(CONFIG.SELECTORS.BURGER);
  const menuNav = byId(CONFIG.SELECTORS.MENU);
  if (!burger || !menuNav) return;

  burger.addEventListener('click', () => {
    const estOuvert = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!estOuvert));
    menuNav.classList.toggle('ouvert', !estOuvert);
    jouerBip(estOuvert ? 220 : 330, 40);
  });

  document.addEventListener('click', (evt) => {
    if (!burger.contains(evt.target) && !menuNav.contains(evt.target)) {
      fermerMenuBurger();
    }
  });

  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape' && menuNav.classList.contains('ouvert')) {
      fermerMenuBurger();
      burger.focus();
    }
  });
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
      window.location.href = ordre[idx + 1];
    }
    if (evt.key === 'ArrowLeft' && idx > 0) {
      jouerBip(330, 40);
      window.location.href = ordre[idx - 1];
    }
  });
}
