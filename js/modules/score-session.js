import { CONFIG } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { formaterScoreAffichage, plafonnerScore } from '../utils/score-helpers.js';

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
  const el = parId(CONFIG.SELECTORS.SCORE);
  if (el) el.textContent = formaterScoreAffichage(valeur);
}

export function ajouterScore(pts) {
  const avant = lireScore();
  if (avant >= 9999) return;
  const apres = plafonnerScore(avant + pts);
  sauvegarderScore(apres);
  afficherScore(apres);
  if (apres >= 9999) {
    setTimeout(() => {
      import('./popup-highscore.js').then(({ afficherPopupMeilleurScore }) => afficherPopupMeilleurScore());
    }, 600);
  }
}
