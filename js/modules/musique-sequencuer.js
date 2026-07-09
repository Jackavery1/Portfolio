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

const BPM_DEFAUT = 128;
const PAS_PAR_MESURE = 16;
const MESURES_PAR_BOUCLE = 8;
const PAS_PAR_BOUCLE = PAS_PAR_MESURE * MESURES_PAR_BOUCLE;
const LOOKAHEAD_MS = 25;
const PLANIFICATION_AVANCE_S = 0.1;

let THEMES = null;
let themeParSection = null;
let themeParFichier = null;
let promesseThemes = null;
let actif = false;
let minuteurPlanificateur = null;
let pasCourant = 0;
let prochainTempsAudio = 0;
let themeCourant = 'HOME';

export function estMusiqueActive() {
  return actif;
}

export function definirActif(valeur) {
  actif = valeur;
}

export function lireThemeCourant() {
  return themeCourant;
}

export function definirThemeCourant(theme) {
  themeCourant = theme;
}

export function definirTheme(theme) {
  if (THEMES?.[theme]) themeCourant = theme;
}

export function resoudreThemePage(sectionId, fichier = 'index.html') {
  if (sectionId && themeParSection?.[sectionId]) return themeParSection[sectionId];
  return themeParFichier?.[fichier] || 'HOME';
}

export async function assurerThemes() {
  if (THEMES) return THEMES;
  if (!promesseThemes) {
    promesseThemes = fetch(new URL('../config/musique-themes.json', import.meta.url))
      .then((reponse) => reponse.json())
      .then((donnees) => {
        THEMES = donnees.THEMES;
        themeParSection = donnees.THEME_PAR_SECTION;
        themeParFichier = donnees.THEME_PAR_FICHIER;
        return THEMES;
      });
  }
  return promesseThemes;
}

function lireCellule(motif, mesure, pasMesure) {
  if (!motif || !Array.isArray(motif)) return 0;
  const ligne = motif[mesure % MESURES_PAR_BOUCLE];
  if (!ligne) return 0;
  return ligne[pasMesure % PAS_PAR_MESURE] ?? 0;
}

function dureePas() {
  const catalogue = THEMES || {};
  const theme = catalogue[themeCourant] || catalogue.HOME;
  if (!theme) return (60 / BPM_DEFAUT) / 4;
  const battement = 60 / theme.bpm;
  return (battement / 4) * theme.facteurTempo;
}

function planifierPas(pasGlobal, tempsAudio) {
  const catalogue = THEMES || {};
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
    const gainHat = hitHat === 2 ? 0.18 : themeCourant === 'STATS' ? 0.09 : 0.04;
    jouerHat(tempsAudio, destination, gainHat);
  }
}

function bouclePlanification() {
  const ctx = obtenirContexte();
  if (!ctx || !actif) return;

  while (prochainTempsAudio < ctx.currentTime + PLANIFICATION_AVANCE_S) {
    planifierPas(pasCourant % PAS_PAR_BOUCLE, prochainTempsAudio);
    prochainTempsAudio += dureePas();
    pasCourant += 1;
  }

  minuteurPlanificateur = setTimeout(bouclePlanification, LOOKAHEAD_MS);
}

export function demarrerSequencuer() {
  const ctx = obtenirContexte();
  if (!ctx) return;

  pasCourant = 0;
  prochainTempsAudio = ctx.currentTime + 0.05;
  if (minuteurPlanificateur) clearTimeout(minuteurPlanificateur);
  bouclePlanification();
}

export function arreterSequencuer() {
  if (minuteurPlanificateur) {
    clearTimeout(minuteurPlanificateur);
    minuteurPlanificateur = null;
  }
}
