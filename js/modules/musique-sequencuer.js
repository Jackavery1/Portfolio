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
  lireEtatSequencuer,
  reinitialiserEtatSequencuerStore,
} from './musique-sequencuer-store.js';

const BPM_DEFAUT = 128;
const PAS_PAR_MESURE = 16;
const MESURES_PAR_BOUCLE = 8;
const PAS_PAR_BOUCLE = PAS_PAR_MESURE * MESURES_PAR_BOUCLE;
const LOOKAHEAD_MS = 25;
const PLANIFICATION_AVANCE_S = 0.1;

export { lireEtatSequencuer } from './musique-sequencuer-store.js';

export function reinitialiserEtatSequencuer() {
  reinitialiserEtatSequencuerStore();
}

export function estMusiqueActive() {
  return lireEtatSequencuer().actif;
}

export function definirActif(valeur) {
  lireEtatSequencuer().actif = valeur;
}

export function lireThemeCourant() {
  return lireEtatSequencuer().themeCourant;
}

export function definirThemeCourant(theme) {
  lireEtatSequencuer().themeCourant = theme;
}

export function definirTheme(theme) {
  const etat = lireEtatSequencuer();
  if (etat.themes?.[theme]) etat.themeCourant = theme;
}

export function resoudreThemePage(sectionId, fichier = 'index.html') {
  const etat = lireEtatSequencuer();
  if (sectionId && etat.themeParSection?.[sectionId]) return etat.themeParSection[sectionId];
  return etat.themeParFichier?.[fichier] || 'HOME';
}

export async function assurerThemes() {
  const etat = lireEtatSequencuer();
  if (etat.themes) return etat.themes;
  if (!etat.promesseThemes) {
    etat.promesseThemes = fetch(new URL('../config/musique-themes.json', import.meta.url))
      .then((reponse) => reponse.json())
      .then((donnees) => {
        etat.themes = donnees.THEMES;
        etat.themeParSection = donnees.THEME_PAR_SECTION;
        etat.themeParFichier = donnees.THEME_PAR_FICHIER;
        return etat.themes;
      });
  }
  return etat.promesseThemes;
}

function lireCellule(motif, mesure, pasMesure) {
  if (!motif || !Array.isArray(motif)) return 0;
  const ligne = motif[mesure % MESURES_PAR_BOUCLE];
  if (!ligne) return 0;
  return ligne[pasMesure % PAS_PAR_MESURE] ?? 0;
}

function dureePas() {
  const etat = lireEtatSequencuer();
  const catalogue = etat.themes || {};
  const theme = catalogue[etat.themeCourant] || catalogue.HOME;
  if (!theme) return 60 / BPM_DEFAUT / 4;
  const battement = 60 / theme.bpm;
  return (battement / 4) * theme.facteurTempo;
}

function planifierPas(pasGlobal, tempsAudio) {
  const etat = lireEtatSequencuer();
  const catalogue = etat.themes || {};
  const theme = catalogue[etat.themeCourant] || catalogue.HOME;
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
    const gainHat = hitHat === 2 ? 0.18 : etat.themeCourant === 'STATS' ? 0.09 : 0.04;
    jouerHat(tempsAudio, destination, gainHat);
  }
}

function bouclePlanification() {
  const etat = lireEtatSequencuer();
  const ctx = obtenirContexte();
  if (!ctx || !etat.actif) return;

  while (etat.prochainTempsAudio < ctx.currentTime + PLANIFICATION_AVANCE_S) {
    planifierPas(etat.pasCourant % PAS_PAR_BOUCLE, etat.prochainTempsAudio);
    etat.prochainTempsAudio += dureePas();
    etat.pasCourant += 1;
  }

  etat.minuteurPlanificateur = setTimeout(bouclePlanification, LOOKAHEAD_MS);
}

export function demarrerSequencuer() {
  const etat = lireEtatSequencuer();
  const ctx = obtenirContexte();
  if (!ctx) return;

  etat.pasCourant = 0;
  etat.prochainTempsAudio = ctx.currentTime + 0.05;
  if (etat.minuteurPlanificateur) clearTimeout(etat.minuteurPlanificateur);
  bouclePlanification();
}

export function arreterSequencuer() {
  const etat = lireEtatSequencuer();
  if (etat.minuteurPlanificateur) {
    clearTimeout(etat.minuteurPlanificateur);
    etat.minuteurPlanificateur = null;
  }
}
