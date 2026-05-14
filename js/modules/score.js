/* ============================================
   Score arcade (sessionStorage, popup 9999)
   ============================================ */

import { CONFIG } from '../config.js';
import { byId } from '../utils/dom.js';
import { jouerBip } from './audio.js';

export function lireScore() {
  try {
    const raw = sessionStorage.getItem(CONFIG.STORAGE.SCORE_KEY);
    if (raw == null || raw === '') return 0;
    const n = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(n) || n < 0) {
      sauvegarderScore(0);
      return 0;
    }
    if (n > 9999) {
      sauvegarderScore(9999);
      return 9999;
    }
    return n;
  } catch (_) {
    return 0;
  }
}

export function sauvegarderScore(valeur) {
  try {
    const n = Math.max(0, Math.min(Number(valeur) || 0, 9999));
    sessionStorage.setItem(CONFIG.STORAGE.SCORE_KEY, String(n));
  } catch (_) {}
}

export function afficherScore(valeur) {
  const n = Math.max(0, Math.min(Number(valeur) || 0, 9999));
  const el = byId(CONFIG.SELECTORS.SCORE);
  if (el) el.textContent = String(n).padStart(6, '0');
}

export function ajouterScore(pts) {
  const avant = lireScore();
  if (avant >= 9999) return;
  const apres = Math.min(avant + pts, 9999);
  sauvegarderScore(apres);
  afficherScore(apres);
  if (apres >= 9999) {
    setTimeout(afficherPopupHighScore, 600);
  }
}

export function afficherPopupHighScore() {
  const popup = byId(CONFIG.SELECTORS.POPUP_HS);
  if (!popup) return;
  const sc = popup.querySelector('.popup-highscore__score');
  if (sc) sc.textContent = String(Math.min(lireScore(), 9999)).padStart(6, '0');
  popup.hidden = false;
  sessionStorage.setItem(CONFIG.STORAGE.HS_POPUP_VU, '1');
  jouerBip(523, 150, 'square');
  setTimeout(() => jouerBip(659, 150, 'square'), 160);
  setTimeout(() => jouerBip(784, 150, 'square'), 320);
  setTimeout(() => jouerBip(1047, 300, 'square'), 480);
}

function fermerPopupHighScoreEtReset() {
  const pu = byId(CONFIG.SELECTORS.POPUP_HS);
  if (!pu || pu.hidden) return;
  pu.hidden = true;
  try {
    sessionStorage.removeItem(CONFIG.STORAGE.HS_POPUP_VU);
  } catch (_) {}
  sauvegarderScore(0);
  afficherScore(0);
}

export function initPopupHighScoreFermer() {
  const popup = byId(CONFIG.SELECTORS.POPUP_HS);
  const btnFermerHS = byId(CONFIG.SELECTORS.POPUP_HS_FERMER);
  if (popup && !popup.dataset.hsEcouteurs) {
    popup.dataset.hsEcouteurs = '1';
    popup.addEventListener('click', (evt) => {
      if (evt.target === popup) fermerPopupHighScoreEtReset();
    });
  }
  if (!document.documentElement.dataset.hsPopupEscape) {
    document.documentElement.dataset.hsPopupEscape = '1';
    document.addEventListener(
      'keydown',
      (evt) => {
        if (evt.key !== 'Escape') return;
        const pu = byId(CONFIG.SELECTORS.POPUP_HS);
        if (!pu || pu.hidden) return;
        evt.preventDefault();
        fermerPopupHighScoreEtReset();
      },
      true
    );
  }
  if (btnFermerHS && !btnFermerHS.dataset.ecouteurHs) {
    btnFermerHS.dataset.ecouteurHs = '1';
    btnFermerHS.addEventListener('click', fermerPopupHighScoreEtReset);
  }
}
