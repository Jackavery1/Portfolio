/* ============================================
   Konami code (toggle + fanfare + score max)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { jouerFanfareVictoire } from './audio.js';
import { afficherPopupMeilleurScore, afficherScore, lireScore, sauvegarderScore } from './score.js';

let saisieKonami = [];

export function initialiserCodeKonami() {
  document.addEventListener('keydown', (evt) => {
    const modalOverlay = parId(CONFIG.SELECTORS.MODAL);
    if (modalOverlay && !modalOverlay.hidden) return;
    const ae = document.activeElement;
    const tag = ae?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (ae?.isContentEditable) return;

    saisieKonami.push(evt.key);
    const seq = CONFIG.KONAMI.SEQUENCE;
    if (saisieKonami.length > seq.length) saisieKonami.shift();
    if (saisieKonami.join(',') === seq.join(',')) {
      document.body.classList.toggle('konami-actif');
      jouerFanfareVictoire();
      const k = lireScore();
      if (k < 9999) {
        sauvegarderScore(9999);
        afficherScore(9999);
        setTimeout(afficherPopupMeilleurScore, 600);
      }
    }
  });
}
