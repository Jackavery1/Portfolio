import { CONFIGURATION } from '../config/index.js';
import { SCORE_PLAFOND, plafonnerScore } from '../utils/score-helpers.js';
import { jouerJingleVictoire } from './musique-loader.js';
import { afficherScore, lireScore, sauvegarderScore } from './score-stockage.js';

export { afficherScore, lireScore, sauvegarderScore };

export function ajouterScore(pts) {
  const avant = lireScore();
  if (avant >= SCORE_PLAFOND) return;
  const apres = plafonnerScore(avant + pts);
  sauvegarderScore(apres);
  afficherScore(apres);
  if (apres > avant) jouerJingleVictoire();
  if (apres >= SCORE_PLAFOND) {
    setTimeout(() => {
      import('./popup-highscore.js').then(({ afficherPopupMeilleurScore }) =>
        afficherPopupMeilleurScore()
      );
    }, 600);
  }
}

/** Bonus unique par session (clé sessionStorage) */
function accorderBonusSession(cle, pts) {
  try {
    if (sessionStorage.getItem(cle)) return false;
    sessionStorage.setItem(cle, '1');
  } catch {
    /* sessionStorage indisponible */
  }
  ajouterScore(pts);
  return true;
}

export function accorderBonusProjet(projetId) {
  if (!projetId) return false;
  return accorderBonusSession(
    CONFIGURATION.STOCKAGE.PREFIXE_PROJET + projetId,
    CONFIGURATION.BONUS_SCORE.PROJET
  );
}

export function accorderBonusDojoBoss(bossId, vaincu) {
  if (!bossId) return false;
  const pts = vaincu
    ? CONFIGURATION.BONUS_SCORE.BOSS_DOJO_VAINCU
    : CONFIGURATION.BONUS_SCORE.BOSS_DOJO;
  return accorderBonusSession(CONFIGURATION.STOCKAGE.PREFIXE_DOJO_BOSS + bossId, pts);
}
