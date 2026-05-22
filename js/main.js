/* ============================================
   Orchestrateur principal — initialisation app
   ============================================ */

import { CONFIG } from './config.js';
import { byId } from './utils/dom.js';
import { chargerPartials } from './modules/partials.js';
import { initNavigationArcade, initNavigationClavier } from './modules/navigation.js';
import { initModalClavier, initModalClicks } from './modules/modal.js';
import { initContactForm } from './modules/contact-form.js';
import { initContactCoordonnees } from './modules/contact-coordonnees.js';
import {
  afficherPopupHighScore,
  afficherScore,
  initPopupHighScoreFermer,
  lireScore,
} from './modules/score.js';
import { initMetaPartage, initBonusScore } from './modules/meta.js';
import { initKonamiCode } from './modules/konami.js';
import { animerBarresSection } from './modules/animations.js';

async function init() {
  const etaitDejaAuMax = lireScore() >= 9999;

  await chargerPartials();

  const popupHs = byId(CONFIG.SELECTORS.POPUP_HS);
  if (popupHs) popupHs.hidden = true;

  initPopupHighScoreFermer();
  initMetaPartage();
  initNavigationArcade();
  initNavigationClavier();
  initModalClavier();
  initModalClicks();
  initBonusScore();
  afficherScore(lireScore());
  initContactCoordonnees();
  await initContactForm();
  initKonamiCode();

  const sid = document.body.dataset.sectionId || 'accueil';
  setTimeout(() => animerBarresSection(sid), 300);

  if (etaitDejaAuMax && !sessionStorage.getItem(CONFIG.STORAGE.HS_POPUP_VU)) {
    setTimeout(afficherPopupHighScore, 1000);
  }
}

document.addEventListener('DOMContentLoaded', init);
