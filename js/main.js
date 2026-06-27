import { CONFIG } from './config/index.js';
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
import { hrefFaviconPng } from './config/favicon.js';

// En dev on sert les HTML sources : le head de prod n'est pas injecté, on ajoute la favicon à la volée.
function assurerFaviconLocale() {
  const href = hrefFaviconPng();
  const existante = document.querySelector('link[rel="icon"][type="image/png"]');
  if (existante) return;

  const liens = [
    { rel: 'icon', type: 'image/png', href, sizes: '64x64' },
    { rel: 'shortcut icon', type: 'image/png', href },
    { rel: 'apple-touch-icon', href, sizes: '180x180' },
  ];

  liens.forEach((attrs) => {
    const link = document.createElement('link');
    Object.entries(attrs).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });
    document.head.appendChild(link);
  });
}

async function init() {
  const sid = document.body.dataset.sectionId || 'accueil';
  const etaitDejaAuMax = lireScore() >= 9999;

  assurerFaviconLocale();
  await chargerPartials();

  const { initContactCoordonnees } = await import(
    './modules/contact-coordonnees.js'
  );
  initContactCoordonnees();

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
    const { initProjetsGrille } = await import('./modules/projets-grille.js');
    const { initModalClavier, initModalClicks } = await import(
      './modules/modal.js'
    );
    initProjetsGrille();
    initModalClavier();
    initModalClicks();
  }

  if (sid === 'accueil') {
    const { initAccueilSocial } = await import('./modules/accueil-social.js');
    initAccueilSocial();
  }

  if (sid === 'dojo') {
    const { initDojoBoss } = await import('./modules/dojo-boss.js');
    initDojoBoss();
  }

  if (sid === 'contact') {
    const { initContactForm } = await import('./modules/contact-form.js');
    const { initContactBandeau } = await import('./modules/contact-bandeau.js');
    initContactBandeau();
    await initContactForm();
  }

  if (sid === 'mentions') {
    const { initMentionsLegales } = await import('./modules/mentions-legales.js');
    initMentionsLegales();
  }

  setTimeout(() => animerBarresSection(sid), 300);

  try {
    if (etaitDejaAuMax && !sessionStorage.getItem(CONFIG.STORAGE.HS_POPUP_VU)) {
      setTimeout(afficherPopupHighScore, 1000);
    }
  } catch {
    /* sessionStorage indisponible */
  }
}

document.addEventListener('DOMContentLoaded', init);

export { init };
