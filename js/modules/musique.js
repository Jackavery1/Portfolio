/* Musique chiptune — orchestration UI, préférences et jingles */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { fichierPageDepuisPathname } from '../utils/page.js';
import { appliquerEtatBoutonMusique, sauvegarderPreferenceMusique } from './musique-bouton.js';
import {
  jouerBlip,
  jouerKick,
  jouerPulse,
  assurerContexteActif,
  obtenirContexte,
  obtenirEtatContexte,
  obtenirGainMaitre,
  suspendreContexte,
} from './musique-audio.js';
import {
  arreterSequencuer,
  assurerThemes,
  definirActif,
  definirThemeCourant,
  demarrerSequencuer,
  estMusiqueActive,
  resoudreThemePage,
} from './musique-sequencuer.js';

const CLE_PREF = CONFIGURATION.STOCKAGE.CLE_MUSIQUE;

const JINGLE_VICTOIRE = [440, 523.25, 659.25, 880, 523.25, 659.25, 783.99];
const JINGLE_SECRET = [440, 466.16, 523.25, 659.25, 698.46, 880];

function detecterTheme() {
  const sid = document.body?.dataset?.sectionId;
  const fichier = fichierPageDepuisPathname(window.location.pathname);
  return resoudreThemePage(sid, fichier);
}

function mettreAJourBouton(bouton) {
  if (!bouton) return;
  appliquerEtatBoutonMusique(bouton, estMusiqueActive() ? 'on' : 'off');
}

export async function activerMusique() {
  await assurerThemes();
  definirThemeCourant(detecterTheme());
  definirActif(true);
  sauvegarderPreferenceMusique(CLE_PREF, true);

  const ctx = assurerContexteActif();
  if (ctx) {
    try {
      await ctx.resume();
      demarrerSequencuer();
    } catch {
      /* autoplay refusé — préférence / bouton restent actifs pour le prochain geste */
    }
  }

  mettreAJourBouton(parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE));
}

async function desactiverMusique() {
  definirActif(false);
  sauvegarderPreferenceMusique(CLE_PREF, false);
  arreterSequencuer();
  mettreAJourBouton(parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE));
  await suspendreContexte();
}

export async function basculerMusique() {
  if (estMusiqueActive()) {
    await desactiverMusique();
  } else {
    await activerMusique();
  }
}

export function jouerBlipNavigation() {
  if (!estMusiqueActive()) return;
  const ctx = obtenirContexte();
  if (!ctx || obtenirEtatContexte() !== 'running') return;
  jouerBlip(ctx.currentTime, obtenirGainMaitre() || ctx.destination);
}

export function jouerJingleVictoire() {
  const ctx = assurerContexteActif();
  if (!ctx) return;

  const debut = ctx.currentTime + 0.02;
  const destination = obtenirGainMaitre() || ctx.destination;
  JINGLE_VICTOIRE.forEach((frequence, i) => {
    jouerPulse(frequence, debut + i * 0.07, 0.09, destination, { amplitude: 0.2 });
  });
}

export function jouerJingleSecret() {
  const ctx = assurerContexteActif();
  if (!ctx) return;

  const debut = ctx.currentTime + 0.02;
  const destination = obtenirGainMaitre() || ctx.destination;
  JINGLE_SECRET.forEach((frequence, i) => {
    jouerPulse(frequence, debut + i * 0.055, 0.1, destination, { amplitude: 0.22 });
    if (i % 2 === 0) jouerKick(debut + i * 0.055, destination);
  });
}

function brancherBoutonMusique() {
  const bouton = parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE);
  if (!bouton || bouton.dataset.branche) return;
  bouton.dataset.branche = 'true';

  definirThemeCourant(detecterTheme());
  mettreAJourBouton(bouton);
  bouton.addEventListener('click', () => basculerMusique());
}

function brancherBipsNavigation() {
  const menu = parId(CONFIGURATION.SELECTEURS.MENU);
  if (!menu || menu.dataset.bipsBranche) return;
  menu.dataset.bipsBranche = 'true';

  menu.querySelectorAll('.nav__bouton').forEach((lien) => {
    lien.addEventListener('mouseenter', jouerBlipNavigation);
  });
}

export function initialiserMusique() {
  void assurerThemes().then(() => definirThemeCourant(detecterTheme()));
  brancherBoutonMusique();
  brancherBipsNavigation();
}
