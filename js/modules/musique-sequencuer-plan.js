/** Planification d’un pas de grille chiptune (motifs thème). */

import {
  jouerHat,
  jouerKick,
  jouerNappe,
  jouerPulse,
  jouerSnare,
  jouerTriangle,
  obtenirGainMaitre,
} from './musique-audio.js';
import { lireEtatSequencuer } from './musique-sequencuer-store.js';

const BPM_DEFAUT = 128;
const PAS_PAR_MESURE = 16;
const MESURES_PAR_BOUCLE = 8;
export const PAS_PAR_BOUCLE = PAS_PAR_MESURE * MESURES_PAR_BOUCLE;

function lireCellule(motif, mesure, pasMesure) {
  if (!motif || !Array.isArray(motif)) return 0;
  const ligne = motif[mesure % MESURES_PAR_BOUCLE];
  if (!ligne) return 0;
  return ligne[pasMesure % PAS_PAR_MESURE] ?? 0;
}

export function dureePas() {
  const { themes, themeCourant } = lireEtatSequencuer();
  const catalogue = themes || {};
  const theme = catalogue[themeCourant] || catalogue.HOME;
  if (!theme) return 60 / BPM_DEFAUT / 4;
  const battement = 60 / theme.bpm;
  return (battement / 4) * theme.facteurTempo;
}

function lireThemeActif() {
  const { themes, themeCourant } = lireEtatSequencuer();
  const catalogue = themes || {};
  return { theme: catalogue[themeCourant] || catalogue.HOME, themeCourant };
}

function planifierNappe(theme, mesure, pasMesure, tempsAudio, destination) {
  if (!theme.nappe || pasMesure !== 0) return;
  const noteNappe = theme.nappe[mesure];
  if (!noteNappe) return;
  jouerNappe(noteNappe, tempsAudio, dureePas() * PAS_PAR_MESURE, destination);
}

function planifierBasse(theme, mesure, pasMesure, tempsAudio, destination, duree) {
  if (!theme.basse) return;
  const noteBasse = lireCellule(theme.basse, mesure, pasMesure);
  if (noteBasse) jouerTriangle(noteBasse, tempsAudio, duree, destination);
}

function planifierMelodie(theme, mesure, pasMesure, tempsAudio, destination, duree) {
  if (!theme.melodie) return;
  const noteMel = lireCellule(theme.melodie, mesure, pasMesure);
  if (!noteMel) return;
  jouerPulse(noteMel, tempsAudio, duree * 0.85, destination, {
    vibrato: theme.vibrato,
    amplitude: 0.14,
  });
}

function planifierArpege(theme, mesure, pasMesure, tempsAudio, destination, duree) {
  if (!theme.arpege) return;
  const noteArp = lireCellule(theme.arpege, mesure, pasMesure);
  if (!noteArp) return;
  const decalage = theme.doubleArpege ? 0 : dureePas() * 0.08;
  jouerPulse(noteArp, tempsAudio + decalage, duree * 0.7, destination, { amplitude: 0.1 });
  if (theme.doubleArpege && pasMesure % 2 === 0) {
    jouerPulse(noteArp * 1.5, tempsAudio + dureePas() * 0.04, duree * 0.55, destination, {
      amplitude: 0.07,
    });
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

function planifierPercussions(theme, mesure, pasMesure, tempsAudio, destination, themeCourant) {
  if (theme.kick && lireCellule(theme.kick, mesure, pasMesure)) {
    jouerKick(tempsAudio, destination);
  }
  if (theme.snare && lireCellule(theme.snare, mesure, pasMesure)) {
    jouerSnare(tempsAudio, destination);
  }
  const hitHat = theme.hat ? lireCellule(theme.hat, mesure, pasMesure) : 0;
  if (hitHat) jouerHat(tempsAudio, destination, amplitudeHat(themeCourant, hitHat));
}

export function planifierPas(pasGlobal, tempsAudio) {
  const { theme, themeCourant } = lireThemeActif();
  if (!theme) return;

  const destination = obtenirGainMaitre();
  const pasMesure = pasGlobal % PAS_PAR_MESURE;
  const mesure = Math.floor(pasGlobal / PAS_PAR_MESURE) % MESURES_PAR_BOUCLE;
  const duree = dureePas() * 0.92;

  planifierNappe(theme, mesure, pasMesure, tempsAudio, destination);
  planifierBasse(theme, mesure, pasMesure, tempsAudio, destination, duree);
  planifierMelodie(theme, mesure, pasMesure, tempsAudio, destination, duree);
  planifierArpege(theme, mesure, pasMesure, tempsAudio, destination, duree);
  planifierPercussions(theme, mesure, pasMesure, tempsAudio, destination, themeCourant);
}
