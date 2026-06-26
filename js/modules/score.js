/* ============================================
   Score arcade (sessionStorage, popup 9999)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { trapTabModal } from '../utils/focus.js';
import { formaterScoreAffichage, plafonnerScore } from '../utils/score-helpers.js';
import { jouerFanfareVictoire } from './audio.js';

let elementFocusAvantPopup = null;

function basculerInertFondPopup(actif) {
  const popup = byId(CONFIG.SELECTORS.POPUP_HS);
  if (!popup) return;

  document.querySelectorAll('body > *').forEach((el) => {
    if (el === popup) return;
    if (actif) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}

export function lireScore() {
  try {
    const raw = sessionStorage.getItem(CONFIG.STORAGE.SCORE_KEY);
    if (raw == null || raw === '') return 0;
    const n = parseInt(String(raw).trim(), 10);
    if (!Number.isFinite(n) || n < 0) {
      sauvegarderScore(0);
      return 0;
    }
    const borne = plafonnerScore(n);
    if (borne !== n) {
      sauvegarderScore(borne);
    }
    return borne;
  } catch {
    return 0;
  }
}

export function sauvegarderScore(valeur) {
  try {
    const n = plafonnerScore(valeur);
    sessionStorage.setItem(CONFIG.STORAGE.SCORE_KEY, String(n));
  } catch {
    /* sessionStorage indisponible */
  }
}

export function afficherScore(valeur) {
  const el = byId(CONFIG.SELECTORS.SCORE);
  if (el) el.textContent = formaterScoreAffichage(valeur);
}

export function ajouterScore(pts) {
  const avant = lireScore();
  if (avant >= 9999) return;
  const apres = plafonnerScore(avant + pts);
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
  if (sc) sc.textContent = formaterScoreAffichage(lireScore());
  elementFocusAvantPopup = document.activeElement;
  popup.hidden = false;
  basculerInertFondPopup(true);
  try {
    sessionStorage.setItem(CONFIG.STORAGE.HS_POPUP_VU, '1');
  } catch {
    /* sessionStorage indisponible */
  }
  jouerFanfareVictoire({ delais: [0, 160, 320, 480], duree: 150 });
  const btnFermer = byId(CONFIG.SELECTORS.POPUP_HS_FERMER);
  if (btnFermer) btnFermer.focus();
}

function fermerPopupHighScore() {
  const pu = byId(CONFIG.SELECTORS.POPUP_HS);
  if (!pu || pu.hidden) return;
  pu.hidden = true;
  basculerInertFondPopup(false);
  const prev = elementFocusAvantPopup;
  elementFocusAvantPopup = null;
  if (prev && typeof prev.focus === 'function') {
    requestAnimationFrame(() => prev.focus());
  }
}

export function initPopupHighScoreFermer() {
  const popup = byId(CONFIG.SELECTORS.POPUP_HS);
  const btnFermerHS = byId(CONFIG.SELECTORS.POPUP_HS_FERMER);
  if (popup && !popup.dataset.hsEcouteurs) {
    popup.dataset.hsEcouteurs = '1';
    popup.addEventListener('click', (evt) => {
      if (evt.target === popup) fermerPopupHighScore();
    });
  }
  if (!document.documentElement.dataset.hsPopupEscape) {
    document.documentElement.dataset.hsPopupEscape = '1';
    document.addEventListener(
      'keydown',
      (evt) => {
        const pu = byId(CONFIG.SELECTORS.POPUP_HS);
        if (!pu || pu.hidden) return;
        if (evt.key === 'Escape') {
          evt.preventDefault();
          fermerPopupHighScore();
          return;
        }
        trapTabModal(evt, pu);
      },
      true,
    );
  }
  if (btnFermerHS && !btnFermerHS.dataset.ecouteurHs) {
    btnFermerHS.dataset.ecouteurHs = '1';
    btnFermerHS.addEventListener('click', fermerPopupHighScore);
  }
}
