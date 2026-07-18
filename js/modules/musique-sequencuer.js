/* Séquenceur chiptune — lookahead, catalogue thèmes, boucle */

import { obtenirContexte } from './musique-audio.js';
import { dureePas, PAS_PAR_BOUCLE, planifierPas } from './musique-sequencuer-plan.js';
import {
  definirActifSequencuer,
  definirCatalogueThemesSequencuer,
  definirMinuteurPlanificateur,
  definirPasCourant,
  definirPromesseThemesSequencuer,
  definirProchainTempsAudio,
  definirSequenceurEnCours,
  definirThemeCourantSequencuer,
  lireEtatSequencuer,
  reinitialiserEtatSequencuerStore,
} from './musique-sequencuer-store.js';

const LOOKAHEAD_MS = 25;
const PLANIFICATION_AVANCE_S = 0.28;

export function reinitialiserEtatSequencuer() {
  reinitialiserEtatSequencuerStore();
}

export function estMusiqueActive() {
  return lireEtatSequencuer().actif;
}

export function definirActif(valeur) {
  definirActifSequencuer(valeur);
}

export function lireThemeCourant() {
  return lireEtatSequencuer().themeCourant;
}

/** Définit le thème si le catalogue est absent ou contient la clé. */
export function definirTheme(theme) {
  const { themes } = lireEtatSequencuer();
  if (themes && !themes[theme]) return;
  definirThemeCourantSequencuer(theme);
}

export function definirThemeCourant(theme) {
  definirTheme(theme);
}

export function resoudreThemePage(sectionId, fichier = 'index.html') {
  const { themeParSection, themeParFichier } = lireEtatSequencuer();
  if (sectionId && themeParSection?.[sectionId]) return themeParSection[sectionId];
  return themeParFichier?.[fichier] || 'HOME';
}

export async function assurerThemes() {
  const { themes, promesseThemes } = lireEtatSequencuer();
  if (themes) return themes;
  if (!promesseThemes) {
    definirPromesseThemesSequencuer(
      fetch(new URL('../config/musique-themes.json', import.meta.url))
        .then((reponse) => {
          if (reponse.ok === false) {
            throw new Error(`thèmes HTTP ${reponse.status}`);
          }
          return reponse.json();
        })
        .then((donnees) => {
          definirCatalogueThemesSequencuer(
            donnees.THEMES,
            donnees.THEME_PAR_SECTION,
            donnees.THEME_PAR_FICHIER
          );
          return donnees.THEMES;
        })
        .catch((err) => {
          definirPromesseThemesSequencuer(null);
          throw err;
        })
    );
  }
  return lireEtatSequencuer().promesseThemes;
}

function bouclePlanification() {
  const { actif, sequenceurEnCours, prochainTempsAudio, pasCourant } = lireEtatSequencuer();
  const ctx = obtenirContexte();
  if (!ctx || !actif || !sequenceurEnCours) return;

  let temps = prochainTempsAudio;
  let pas = pasCourant;

  while (temps < ctx.currentTime + PLANIFICATION_AVANCE_S) {
    planifierPas(pas % PAS_PAR_BOUCLE, temps);
    temps += dureePas();
    pas += 1;
  }

  definirProchainTempsAudio(temps);
  definirPasCourant(pas);

  if (lireEtatSequencuer().sequenceurEnCours && lireEtatSequencuer().actif) {
    definirMinuteurPlanificateur(setTimeout(bouclePlanification, LOOKAHEAD_MS));
  }
}

export function demarrerSequencuer() {
  const { minuteurPlanificateur } = lireEtatSequencuer();
  const ctx = obtenirContexte();
  if (!ctx) return;

  if (minuteurPlanificateur) {
    clearTimeout(minuteurPlanificateur);
    definirMinuteurPlanificateur(null);
  }
  definirSequenceurEnCours(false);

  definirPasCourant(0);
  definirProchainTempsAudio(ctx.currentTime + 0.05);
  definirSequenceurEnCours(true);
  bouclePlanification();
}

export function arreterSequencuer() {
  const { minuteurPlanificateur } = lireEtatSequencuer();
  definirSequenceurEnCours(false);
  if (minuteurPlanificateur) {
    clearTimeout(minuteurPlanificateur);
    definirMinuteurPlanificateur(null);
  }
}
