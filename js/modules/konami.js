/* ============================================
   Konami code (toggle + fanfare + score max)
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { jouerFanfareVictoire } from './audio.js';
import { jouerJingleSecret } from './musique-loader.js';
import { afficherPopupMeilleurScore, afficherScore, lireScore, sauvegarderScore } from './score.js';
import { SCORE_PLAFOND } from '../utils/score-helpers.js';

let saisieKonami = [];

export function initialiserCodeKonami() {
  document.addEventListener('keydown', (evt) => {
    const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
    if (modalOverlay && !modalOverlay.hidden) return;
    const ae = document.activeElement;
    const tag = ae?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (ae?.isContentEditable) return;

    saisieKonami.push(evt.key);
    const seq = CONFIGURATION.KONAMI.SEQUENCE;
    if (saisieKonami.length > seq.length) saisieKonami.shift();
    if (saisieKonami.join(',') === seq.join(',')) {
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
  });
}
