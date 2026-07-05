import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { piegerTabulationModale } from '../utils/focus.js';
import { basculerInertFond } from '../utils/inert.js';
import { formaterScoreAffichage } from '../utils/score-helpers.js';
import { jouerFanfareVictoire } from './audio.js';
import { lireScore } from './score-session.js';

let elementFocusAvantPopup = null;

export function afficherPopupMeilleurScore() {
  const popup = parId(CONFIGURATION.SELECTEURS.POPUP_HS);
  if (!popup) return;
  const sc = popup.querySelector('.popup-highscore__score');
  if (sc) sc.textContent = formaterScoreAffichage(lireScore());
  elementFocusAvantPopup = document.activeElement;
  popup.hidden = false;
  basculerInertFond(true, popup);
  try {
    sessionStorage.setItem(CONFIGURATION.STOCKAGE.POPUP_HS_VU, '1');
  } catch {
    /* sessionStorage indisponible */
  }
  jouerFanfareVictoire({ delais: [0, 160, 320, 480], duree: 150 });
  const btnFermer = parId(CONFIGURATION.SELECTEURS.POPUP_HS_FERMER);
  if (btnFermer) btnFermer.focus();
}

function fermerPopupMeilleurScore() {
  const pu = parId(CONFIGURATION.SELECTEURS.POPUP_HS);
  if (!pu || pu.hidden) return;
  pu.hidden = true;
  basculerInertFond(false);
  const prev = elementFocusAvantPopup;
  elementFocusAvantPopup = null;
  if (prev && typeof prev.focus === 'function') {
    requestAnimationFrame(() => prev.focus());
  }
}

export function initialiserFermeturePopupMeilleurScore() {
  const popup = parId(CONFIGURATION.SELECTEURS.POPUP_HS);
  const btnFermerHS = parId(CONFIGURATION.SELECTEURS.POPUP_HS_FERMER);
  if (popup && !popup.dataset.hsEcouteurs) {
    popup.dataset.hsEcouteurs = '1';
    popup.addEventListener('click', (evt) => {
      if (evt.target === popup) fermerPopupMeilleurScore();
    });
  }
  if (!document.documentElement.dataset.hsPopupEscape) {
    document.documentElement.dataset.hsPopupEscape = '1';
    document.addEventListener(
      'keydown',
      (evt) => {
        const pu = parId(CONFIGURATION.SELECTEURS.POPUP_HS);
        if (!pu || pu.hidden) return;
        if (evt.key === 'Escape') {
          evt.preventDefault();
          fermerPopupMeilleurScore();
          return;
        }
        piegerTabulationModale(evt, pu);
      },
      true
    );
  }
  if (btnFermerHS && !btnFermerHS.dataset.ecouteurHs) {
    btnFermerHS.dataset.ecouteurHs = '1';
    btnFermerHS.addEventListener('click', fermerPopupMeilleurScore);
  }
}
