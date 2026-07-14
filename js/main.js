import { CONFIGURATION } from './config/index.js';
import { parId } from './utils/dom.js';
import { chargerPartiels } from './modules/partials.js';
import {
  initialiserNavigationArcade,
  initialiserNavigationClavier,
  annoncerNavigationClavier,
} from './modules/navigation.js';
import {
  afficherPopupMeilleurScore,
  afficherScore,
  initialiserFermeturePopupMeilleurScore,
  lireScore,
} from './modules/score.js';
import { initialiserMetaPartage, initialiserBonusScore } from './modules/meta.js';
import { initialiserCodeKonami } from './modules/konami.js';
import { initialiserMusique } from './modules/musique-loader.js';
import { enregistrerServiceWorker } from './modules/service-worker-register.js';
import { animerBarresSection } from './modules/animations.js';
import { urlFaviconPng } from './config/favicon.js';
import { SCORE_PLAFOND } from './utils/score-helpers.js';
import { initialiserSection } from './config/sections.js';
import { afficherBandeauDev } from './utils/dev-mode.js';

function activerOverlayCrtApresPeinture() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('crt-pret');
    });
  });
}

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
  afficherBandeauDev();
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
  initialiserMusique();

  await initialiserSection(sid);

  setTimeout(() => animerBarresSection(sid), 300);

  try {
    if (etaitDejaAuMax && !sessionStorage.getItem(CONFIGURATION.STOCKAGE.POPUP_HS_VU)) {
      setTimeout(afficherPopupMeilleurScore, 1000);
    }
  } catch {
    /* sessionStorage indisponible */
  }

  document.body.dataset.appReady = 'true';
  activerOverlayCrtApresPeinture();
  enregistrerServiceWorker();
}

document.addEventListener('DOMContentLoaded', initialiser);

export { initialiser };
