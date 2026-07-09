import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { formaterScoreAffichage, plafonnerScore } from '../utils/score-helpers.js';

export function lireScore() {
  try {
    const raw = sessionStorage.getItem(CONFIGURATION.STOCKAGE.CLE_SCORE);
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
    sessionStorage.setItem(CONFIGURATION.STOCKAGE.CLE_SCORE, String(n));
  } catch {
    /* sessionStorage indisponible */
  }
}

export function afficherScore(valeur) {
  const el = parId(CONFIGURATION.SELECTEURS.SCORE);
  if (el) el.textContent = formaterScoreAffichage(valeur);
}
