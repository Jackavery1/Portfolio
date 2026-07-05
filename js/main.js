import { CONFIGURATION } from './config/index.js';
import { parId } from './utils/dom.js';
import { chargerPartiels } from './modules/partials.js';
import { initialiserNavigationArcade, initialiserNavigationClavier, annoncerNavigationClavier } from './modules/navigation.js';
import {
  afficherPopupMeilleurScore,
  afficherScore,
  initialiserFermeturePopupMeilleurScore,
  lireScore,
} from './modules/score.js';
import { initialiserMetaPartage, initialiserBonusScore } from './modules/meta.js';
import { initialiserCodeKonami } from './modules/konami.js';
import { enregistrerServiceWorker } from './modules/service-worker-register.js';
import { animerBarresSection } from './modules/animations.js';
import { urlFaviconPng } from './config/favicon.js';
import { SCORE_PLAFOND } from './utils/score-helpers.js';

// En dev on sert les HTML sources : le head de prod n'est pas injecté, on ajoute la favicon à la volée.
function assurerFaviconLocale() {
  const href = urlFaviconPng();
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

async function initialiser() {
  const sid = document.body.dataset.sectionId || 'accueil';
  const etaitDejaAuMax = lireScore() >= SCORE_PLAFOND;

  assurerFaviconLocale();
  await chargerPartiels();
  annoncerNavigationClavier();

  const popupHs = parId(CONFIGURATION.SELECTEURS.POPUP_HS);
  if (popupHs) popupHs.hidden = true;

  initialiserFermeturePopupMeilleurScore();
  initialiserMetaPartage();
  initialiserNavigationArcade();
  initialiserNavigationClavier();
  initialiserBonusScore();
  afficherScore(lireScore());
  initialiserCodeKonami();

  if (sid === 'projets') {
    const { initialiserGrilleProjets } = await import('./modules/projets-grille.js');
    const { initialiserClavierModale, initialiserClicsModale } = await import('./modules/modal.js');
    initialiserGrilleProjets();
    initialiserClavierModale();
    initialiserClicsModale();
  }

  if (sid === 'accueil') {
    const { initialiserAccueilSocial } = await import('./modules/accueil-social.js');
    initialiserAccueilSocial();
  }

  if (sid === 'dojo') {
    const { initialiserDojoBoss } = await import('./modules/dojo-boss.js');
    initialiserDojoBoss();
  }

  if (sid === 'contact') {
    const { initialiserPageContact } = await import('./modules/contact.js');
    await initialiserPageContact();
  }

  if (sid === 'mentions') {
    const { initialiserMentionsLegales } = await import('./modules/mentions-legales.js');
    initialiserMentionsLegales();
  }

  setTimeout(() => animerBarresSection(sid), 300);

  try {
    if (etaitDejaAuMax && !sessionStorage.getItem(CONFIGURATION.STOCKAGE.POPUP_HS_VU)) {
      setTimeout(afficherPopupMeilleurScore, 1000);
    }
  } catch {
    /* sessionStorage indisponible */
  }

  document.body.dataset.appReady = 'true';
  enregistrerServiceWorker();
}

document.addEventListener('DOMContentLoaded', initialiser);

export { initialiser };
