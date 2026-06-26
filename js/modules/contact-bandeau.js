/* ============================================
   Bandeau contact : disponibilité ↔ téléchargement CV
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { jouerBip } from './audio.js';

export function initContactBandeau() {
  const dispo = byId(CONFIG.SELECTORS.CONTACT_BANDEAU_DISPO);
  const cvBloc = byId('js-bandeau-cv-bloc');
  const cv = byId(CONFIG.SELECTORS.CONTACT_BANDEAU_CV);
  const retour = byId('js-bandeau-retour');
  if (!dispo || !cvBloc || !cv || !retour) return;

  cv.href = CONFIG.CONTACT.CV_HREF;
  cv.download = CONFIG.CONTACT.CV_DOWNLOAD;

  const afficherCv = () => {
    dispo.hidden = true;
    cvBloc.hidden = false;
    jouerBip(523, 50, 'square');
    cv.focus();
  };

  const afficherDispo = () => {
    cvBloc.hidden = true;
    dispo.hidden = false;
    jouerBip(392, 50, 'square');
    dispo.focus();
  };

  dispo.addEventListener('click', afficherCv);
  retour.addEventListener('click', afficherDispo);
}
