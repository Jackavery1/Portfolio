/* ============================================
   Konami code (toggle + fanfare + score max)
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import {
  enregistrerToucheKonami,
  reinitialiserSaisieKonami,
} from '../utils/konami-buffer.js';
import { jouerFanfareVictoire } from './audio.js';
import { jouerJingleSecret } from './musique-loader.js';
import { afficherPopupMeilleurScore, afficherScore, lireScore, sauvegarderScore } from './score.js';
import { SCORE_PLAFOND } from '../utils/score-helpers.js';

export function initialiserCodeKonami() {
  if (document.documentElement.dataset.konamiInit) return;
  document.documentElement.dataset.konamiInit = '1';

  document.addEventListener(
    'keydown',
    (evt) => {
      const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
      if (modalOverlay && !modalOverlay.hidden) return;
      const ae = document.activeElement;
      const tag = ae?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (ae?.isContentEditable) return;

      if (enregistrerToucheKonami(evt.key)) {
        reinitialiserSaisieKonami();
        document.body.classList.toggle('konami-actif');
        jouerFanfareVictoire();
        jouerJingleSecret();
        const k = lireScore();
        if (k < SCORE_PLAFOND) {
          sauvegarderScore(SCORE_PLAFOND);
          afficherScore(SCORE_PLAFOND);
          setTimeout(afficherPopupMeilleurScore, 600);
        }
      }
    },
    { capture: true }
  );
}
