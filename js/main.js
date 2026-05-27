/* ============================================
   Orchestrateur principal — initialisation app
   ============================================ */

import { CONFIG } from './config.js';
import { byId } from './utils/dom.js';
import { chargerPartials } from './modules/partials.js';
import { initNavigationArcade, initNavigationClavier } from './modules/navigation.js';
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
  const sid = document.body.dataset.sectionId || 'accueil';
  const etaitDejaAuMax = lireScore() >= 9999;

  await chargerPartials();

  const popupHs = byId(CONFIG.SELECTORS.POPUP_HS);
  if (popupHs) popupHs.hidden = true;

  initPopupHighScoreFermer();
  initMetaPartage();
  initNavigationArcade();
  initNavigationClavier();
  initBonusScore();
  afficherScore(lireScore());
  initKonamiCode();

  if (sid === 'projets') {
    const { initModalClavier, initModalClicks } = await import(
      './modules/modal.js'
    );
    initModalClavier();
    initModalClicks();
  }

  if (sid === 'contact') {
    const { initContactCoordonnees } = await import(
      './modules/contact-coordonnees.js'
    );
    const { initContactForm } = await import('./modules/contact-form.js');
    const { initContactBandeau } = await import('./modules/contact-bandeau.js');
    initContactCoordonnees();
    initContactBandeau();
    await initContactForm();
  }

  setTimeout(() => animerBarresSection(sid), 300);

  if (etaitDejaAuMax && !sessionStorage.getItem(CONFIG.STORAGE.HS_POPUP_VU)) {
    setTimeout(afficherPopupHighScore, 1000);
  }
}

document.addEventListener('DOMContentLoaded', init);
