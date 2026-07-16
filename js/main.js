import { CONFIGURATION } from './config/index.js';
import { parId } from './utils/dom.js';
import { chargerPartiels } from './modules/partials.js';
import {
  initialiserNavigationArcade,
  initialiserNavigationClavier,
  annoncerNavigationClavier,
} from './modules/navigation.js';
import { initialiserCodeKonami } from './modules/konami.js';
import {
  afficherPopupMeilleurScore,
  afficherScore,
  initialiserFermeturePopupMeilleurScore,
  lireScore,
} from './modules/score.js';
import { initialiserMetaPartage, initialiserBonusScore } from './modules/meta.js';
import { initialiserMusique } from './modules/musique-loader.js';
import { urlFaviconPng } from './config/favicon.js';
import { SCORE_PLAFOND } from './utils/score-helpers.js';
import { initialiserSection } from './config/sections.js';
import { afficherBandeauDev } from './utils/dev-mode.js';
import { planifierIdleDense } from './utils/pages-denses.js';

function activerOverlayCrtApresPeinture(sectionId) {
  const activer = () => document.documentElement.classList.add('crt-pret');
  if (planifierIdleDense(sectionId, activer, 2000)) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(activer);
  });
}

function planifierTachesDifferees(sid) {
  const planifierAnim = () => {
    import('./modules/animations.js').then((module) => module.animerBarresSection(sid));
  };

  if (!planifierIdleDense(sid, planifierAnim, 3000)) {
    setTimeout(planifierAnim, 300);
  }

  const planifier =
    typeof requestIdleCallback === 'function'
      ? (fn) => requestIdleCallback(fn, { timeout: 4000 })
      : (fn) => setTimeout(fn, 1);

  planifier(() => {
    import('./modules/service-worker-register.js').then((module) =>
      module.enregistrerServiceWorker()
    );
  });
}

function planifierExtrasInteractifs(sid) {
  const lancer = () => {
    initialiserCodeKonami();
    initialiserBonusScore();
  };
  if (!planifierIdleDense(sid, lancer, 2500)) lancer();
}

async function planifierSection(sid) {
  if (
    planifierIdleDense(
      sid,
      () => {
        void initialiserSection(sid);
      },
      2500
    )
  ) {
    return;
  }
  await initialiserSection(sid);
}

function planifierMusique(sid) {
  if (!planifierIdleDense(sid, () => initialiserMusique(), 2500)) {
    initialiserMusique();
  }
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
  planifierExtrasInteractifs(sid);
  afficherScore(lireScore());
  planifierMusique(sid);

  await planifierSection(sid);

  planifierTachesDifferees(sid);

  try {
    if (etaitDejaAuMax && !sessionStorage.getItem(CONFIGURATION.STOCKAGE.POPUP_HS_VU)) {
      setTimeout(afficherPopupMeilleurScore, 1000);
    }
  } catch {
    /* sessionStorage indisponible */
  }

  document.body.dataset.appReady = 'true';
  activerOverlayCrtApresPeinture(sid);
}

document.addEventListener('DOMContentLoaded', initialiser);

export { initialiser };
