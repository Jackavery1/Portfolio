/* Séquenceur chiptune — planification lookahead, grilles thématiques */

import {
  jouerHat,
  jouerKick,
  jouerNappe,
  jouerPulse,
  jouerSnare,
  jouerTriangle,
  obtenirContexte,
  obtenirGainMaitre,
} from './musique-audio.js';
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

const BPM_DEFAUT = 128;
const PAS_PAR_MESURE = 16;
const MESURES_PAR_BOUCLE = 8;
const PAS_PAR_BOUCLE = PAS_PAR_MESURE * MESURES_PAR_BOUCLE;
const LOOKAHEAD_MS = 25;
const PLANIFICATION_AVANCE_S = 0.28;

export { lireEtatSequencuer } from './musique-sequencuer-store.js';

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

export function definirThemeCourant(theme) {
  definirThemeCourantSequencuer(theme);
}

export function definirTheme(theme) {
  const { themes } = lireEtatSequencuer();
  if (themes?.[theme]) definirThemeCourantSequencuer(theme);
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
        .then((reponse) => reponse.json())
        .then((donnees) => {
          definirCatalogueThemesSequencuer(
            donnees.THEMES,
            donnees.THEME_PAR_SECTION,
            donnees.THEME_PAR_FICHIER
          );
          return donnees.THEMES;
        })
    );
  }
  return lireEtatSequencuer().promesseThemes;
}

function lireCellule(motif, mesure, pasMesure) {
  if (!motif || !Array.isArray(motif)) return 0;
  const ligne = motif[mesure % MESURES_PAR_BOUCLE];
  if (!ligne) return 0;
  return ligne[pasMesure % PAS_PAR_MESURE] ?? 0;
}

function dureePas() {
  const { themes, themeCourant } = lireEtatSequencuer();
  const catalogue = themes || {};
  const theme = catalogue[themeCourant] || catalogue.HOME;
  if (!theme) return 60 / BPM_DEFAUT / 4;
  const battement = 60 / theme.bpm;
  return (battement / 4) * theme.facteurTempo;
}

function planifierPas(pasGlobal, tempsAudio) {
  const { themes, themeCourant } = lireEtatSequencuer();
  const catalogue = themes || {};
  const theme = catalogue[themeCourant] || catalogue.HOME;
  if (!theme) return;

  const destination = obtenirGainMaitre();
  const pasMesure = pasGlobal % PAS_PAR_MESURE;
  const mesure = Math.floor(pasGlobal / PAS_PAR_MESURE) % MESURES_PAR_BOUCLE;
  const duree = dureePas() * 0.92;
  const dureeMesure = dureePas() * PAS_PAR_MESURE;

  if (theme.nappe && pasMesure === 0) {
    const noteNappe = theme.nappe[mesure];
    if (noteNappe) jouerNappe(noteNappe, tempsAudio, dureeMesure, destination);
  }

  if (theme.basse) {
    const noteBasse = lireCellule(theme.basse, mesure, pasMesure);
    if (noteBasse) jouerTriangle(noteBasse, tempsAudio, duree, destination);
  }

  if (theme.melodie) {
    const noteMel = lireCellule(theme.melodie, mesure, pasMesure);
    if (noteMel) {
      jouerPulse(noteMel, tempsAudio, duree * 0.85, destination, {
        vibrato: theme.vibrato,
        amplitude: 0.14,
      });
    }
  }

  if (theme.arpege) {
    const noteArp = lireCellule(theme.arpege, mesure, pasMesure);
    if (noteArp) {
      const decalage = theme.doubleArpege ? 0 : dureePas() * 0.08;
      jouerPulse(noteArp, tempsAudio + decalage, duree * 0.7, destination, { amplitude: 0.1 });
      if (theme.doubleArpege && pasMesure % 2 === 0) {
        jouerPulse(noteArp * 1.5, tempsAudio + dureePas() * 0.04, duree * 0.55, destination, {
          amplitude: 0.07,
        });
      }
    }
  }

  if (theme.kick && lireCellule(theme.kick, mesure, pasMesure)) {
    jouerKick(tempsAudio, destination);
  }

  if (theme.snare && lireCellule(theme.snare, mesure, pasMesure)) {
    jouerSnare(tempsAudio, destination);
  }

  const hitHat = theme.hat ? lireCellule(theme.hat, mesure, pasMesure) : 0;
  if (hitHat) {
    jouerHat(tempsAudio, destination, amplitudeHat(themeCourant, hitHat));
  }
}

function amplitudeHat(themeCourant, hitHat) {
  if (hitHat === 2) {
    if (themeCourant === 'STATS') return 0.16;
    return 0.18;
  }
  const gains = { HOME: 0.07, WORK: 0.06, STORY: 0.05, DOJO: 0.05, STATS: 0.09 };
  return gains[themeCourant] ?? 0.04;
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
