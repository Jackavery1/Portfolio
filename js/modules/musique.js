/* ============================================
   Musique chiptune temps réel — Web Audio API
   Style NES (2A03) : 2 pulse, 1 triangle, bruit
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';

/** Clé localStorage pour la préférence utilisateur */
const CLE_PREF = CONFIGURATION.STOCKAGE.CLE_MUSIQUE;

/** Tempo de base (BPM) et résolution du séquenceur */
const BPM_DEFAUT = 128;
const BPM_DOJO = 140;
const PAS_PAR_MESURE = 16;
const MESURES_PAR_BOUCLE = 8;
const PAS_PAR_BOUCLE = PAS_PAR_MESURE * MESURES_PAR_BOUCLE;

/** Scheduler « A Tale of Two Clocks » — lookahead + setTimeout */
const LOOKAHEAD_MS = 25;
const PLANIFICATION_AVANCE_S = 0.1;

/** Volume maître très bas — ambiance discrète, jamais agressive au bureau */
const VOLUME_MAITRE = 0.07;

/** Enveloppes ADSR courtes (grain 8-bit) */
const ATTAQUE_S = 0.005;
const RELEASE_S = 0.04;

/** Fréquences — pentatonique mineure de La (tonalité de base) */
const GAMME = {
  A2: 110,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98,
  A3: 220,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392,
  A4: 440,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  C6: 1046.5,
};

/** Extension phrygienne pour le thème DOJO */
const GAMME_PHYRGIENNE = {
  ...GAMME,
  Bb2: 116.54,
  Bb3: 233.08,
  Bb4: 466.16,
  F3: 174.61,
  F4: 349.23,
  F5: 698.46,
};

/** Répète une mesure type sur 8 mesures */
function repeter8(mesureType) {
  return Array.from({ length: MESURES_PAR_BOUCLE }, () => [...mesureType]);
}

/** Lit une cellule dans un motif multi-mesures [mesure][pas] */
function lireCellule(motif, mesure, pasMesure) {
  if (!motif || !Array.isArray(motif)) return 0;
  const ligne = motif[mesure % MESURES_PAR_BOUCLE];
  if (!ligne) return 0;
  return ligne[pasMesure % PAS_PAR_MESURE] ?? 0;
}

/* ── Mesures types HOME / WORK (structure A-A-B-A-A-A-B-C) ── */

const MEL_A = [
  0, 0, GAMME.E4, 0, 0, GAMME.G4, 0, 0, 0, GAMME.E4, 0, GAMME.D4, 0, GAMME.C4, 0, 0,
];

const MEL_B = [
  0, 0, GAMME.C5, 0, 0, GAMME.D5, 0, 0, 0, GAMME.E5, 0, GAMME.D5, 0, GAMME.C5, 0, 0,
];

const MEL_B_PRIME = [
  0, 0, GAMME.D5, 0, 0, GAMME.E5, 0, 0, 0, GAMME.G5, 0, GAMME.E5, 0, GAMME.D5, 0, 0,
];

const MEL_C = [
  0, 0, 0, GAMME.A4, 0, 0, GAMME.G4, 0, 0, GAMME.E4, 0, 0, GAMME.A3, 0, 0, GAMME.A2,
];

const BASSE_AM = [
  GAMME.A2, 0, GAMME.A2, 0, GAMME.E2, 0, GAMME.A2, 0, GAMME.A2, 0, GAMME.G2, 0, GAMME.E2, 0,
  GAMME.A2, 0,
];

const BASSE_AM_ALT = [
  GAMME.A2, 0, 0, GAMME.E2, 0, 0, GAMME.A2, 0, GAMME.D2, 0, 0, GAMME.E2, 0, 0, GAMME.A2, 0,
];

const BASSE_F = [
  GAMME.F2, 0, GAMME.D2, 0, GAMME.F2, 0, GAMME.A2, 0, GAMME.D2, 0, GAMME.F2, 0, GAMME.E2, 0,
  GAMME.D2, 0,
];

const BASSE_E = [
  GAMME.E2, 0, GAMME.E2, 0, GAMME.A2, 0, GAMME.E2, 0, GAMME.E2, 0, GAMME.G2, 0, GAMME.A2, 0,
  GAMME.E2, 0,
];

const BASSE_D = [
  GAMME.D2, 0, GAMME.D2, 0, GAMME.A2, 0, GAMME.D2, 0, GAMME.E2, 0, GAMME.D2, 0, GAMME.A2, 0,
  GAMME.D2, 0,
];

const BASSE_E_CADENCE = [
  GAMME.E2, 0, GAMME.E2, 0, GAMME.A2, 0, 0, 0, GAMME.E2, 0, GAMME.A2, 0, GAMME.A3, 0, GAMME.A2, 0,
];

const ARP_A = [
  0, GAMME.C4, 0, GAMME.E4, 0, GAMME.G4, 0, GAMME.C5, 0, GAMME.E4, 0, GAMME.G4, 0, GAMME.C5, 0,
  GAMME.E5,
];

const ARP_HAUT = [
  0, GAMME.C5, 0, GAMME.E5, 0, GAMME.G5, 0, GAMME.C6, 0, GAMME.E5, 0, GAMME.G5, 0, GAMME.C6, 0,
  GAMME.E5,
];

const ARP_CADENCE = [
  0, 0, GAMME.E4, 0, 0, GAMME.C4, 0, 0, 0, GAMME.A3, 0, 0, 0, 0, 0, 0,
];

const KICK_STD = [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0];

const KICK_FILL = [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1];

const HAT_STD = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];

const ARP_DOUBLE = [
  GAMME.A3, GAMME.C4, GAMME.E4, GAMME.A4, GAMME.C4, GAMME.E4, GAMME.A4, GAMME.C5, GAMME.E4,
  GAMME.A4, GAMME.C5, GAMME.E5, GAMME.A4, GAMME.C5, GAMME.E5, GAMME.A4,
];

const MOTIFS_COMMUNS = {
  melodieAABC: [MEL_A, MEL_A, MEL_B, MEL_B, MEL_A, MEL_A, MEL_B_PRIME, MEL_C],
  basseAmFED: [BASSE_AM, BASSE_AM_ALT, BASSE_F, BASSE_E, BASSE_AM, BASSE_AM_ALT, BASSE_D, BASSE_E_CADENCE],
  arpegeAABC: [ARP_A, ARP_A, ARP_A, ARP_A, ARP_HAUT, ARP_A, ARP_A, ARP_CADENCE],
  kickStandard: [KICK_STD, KICK_STD, KICK_STD, KICK_STD, KICK_STD, KICK_STD, KICK_STD, KICK_FILL],
  hatStandard: repeter8(HAT_STD),
  arpegeDouble8: repeter8(ARP_DOUBLE),
};

/* ── STORY : mélodie espacée sur 8 mesures ── */

const MEL_STORY_1 = [
  0, 0, 0, 0, GAMME.A4, 0, 0, 0, 0, 0, GAMME.G4, 0, 0, 0, GAMME.E4, 0,
];

const MEL_STORY_2 = [
  0, 0, 0, 0, 0, 0, GAMME.C5, 0, 0, 0, 0, 0, GAMME.A4, 0, 0, 0,
];

const MEL_STORY_3 = [
  0, 0, 0, 0, GAMME.G4, 0, 0, 0, 0, 0, 0, 0, GAMME.E4, 0, GAMME.D4, 0,
];

const MOTIFS_STORY = {
  melodie: [MEL_STORY_1, MEL_STORY_2, MEL_STORY_1, MEL_STORY_3, MEL_STORY_1, MEL_STORY_2, MEL_STORY_3, MEL_C],
  basse: MOTIFS_COMMUNS.basseAmFED,
  arpege: MOTIFS_COMMUNS.arpegeAABC,
  kick: null,
  hat: MOTIFS_COMMUNS.hatStandard,
};

/* ── STATS : groove minimaliste audible ── */

const BASSE_STATS_1 = [
  GAMME.A2, 0, GAMME.A2, 0, GAMME.E2, 0, GAMME.A2, 0, GAMME.A2, 0, GAMME.G2, 0, GAMME.E2, 0,
  GAMME.A2, 0,
];

const BASSE_STATS_2 = [
  GAMME.A2, 0, GAMME.A2, 0, GAMME.D2, 0, GAMME.A2, 0, GAMME.A2, 0, GAMME.E2, 0, GAMME.D2, 0,
  GAMME.A2, 0,
];

const BASSE_STATS_3 = [
  GAMME.D2, 0, GAMME.D2, 0, GAMME.A2, 0, GAMME.D2, 0, GAMME.E2, 0, GAMME.D2, 0, GAMME.G2, 0,
  GAMME.E2, 0,
];

const HAT_STATS = [
  0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1,
];

const KICK_STATS = [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0];

const MOTIFS_STATS = {
  basse: [
    BASSE_STATS_1,
    BASSE_STATS_2,
    BASSE_STATS_3,
    BASSE_STATS_2,
    BASSE_STATS_1,
    BASSE_STATS_2,
    BASSE_STATS_3,
    BASSE_E_CADENCE,
  ],
  melodie: null,
  arpege: null,
  kick: repeter8(KICK_STATS),
  hat: repeter8(HAT_STATS),
  nappe: [GAMME.A2, GAMME.A2, GAMME.D2, GAMME.E2, GAMME.A2, GAMME.A2, GAMME.D2, GAMME.E2],
};

/* ── DOJO : boss battle phrygien sur 8 mesures ── */

const BASSE_DOJO_TENSION = [
  GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.Bb2, 0, GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.Bb2, 0,
  GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.Bb2, 0, GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.E2, 0,
];

const BASSE_DOJO_EXPLOSION = [
  GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.Bb2, 0, GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.Bb2, 0,
  GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.Bb2, 0, GAMME_PHYRGIENNE.A2, 0, GAMME_PHYRGIENNE.F3, 0,
];

const MEL_DOJO_GRAVE = [
  0, GAMME_PHYRGIENNE.E4, 0, GAMME_PHYRGIENNE.F4, 0, GAMME_PHYRGIENNE.E4, 0, GAMME_PHYRGIENNE.Bb3,
  0, GAMME_PHYRGIENNE.E4, 0, GAMME_PHYRGIENNE.F4, 0, GAMME_PHYRGIENNE.E4, 0, 0,
];

const MEL_DOJO_AIGU = [
  0, GAMME_PHYRGIENNE.E5, 0, GAMME_PHYRGIENNE.F5, 0, GAMME_PHYRGIENNE.E5, 0, GAMME_PHYRGIENNE.Bb4,
  0, GAMME_PHYRGIENNE.E5, 0, GAMME_PHYRGIENNE.F5, 0, GAMME_PHYRGIENNE.E5, 0, GAMME_PHYRGIENNE.C5,
];

const ARP_DOJO_SPARSE = [
  0, GAMME_PHYRGIENNE.A3, 0, GAMME_PHYRGIENNE.Bb3, 0, 0, GAMME_PHYRGIENNE.E4, 0, 0,
  GAMME_PHYRGIENNE.Bb3, 0, GAMME_PHYRGIENNE.A3, 0, 0, GAMME_PHYRGIENNE.G4, 0,
];

const ARP_DOJO_RAPIDE = [
  GAMME_PHYRGIENNE.A3, GAMME_PHYRGIENNE.Bb3, GAMME_PHYRGIENNE.A3, GAMME_PHYRGIENNE.Bb3,
  GAMME_PHYRGIENNE.C5, GAMME_PHYRGIENNE.Bb3, GAMME_PHYRGIENNE.A3, GAMME_PHYRGIENNE.G4,
  GAMME_PHYRGIENNE.E4, GAMME_PHYRGIENNE.A3, GAMME_PHYRGIENNE.Bb3, GAMME_PHYRGIENNE.C5,
  GAMME_PHYRGIENNE.E4, GAMME_PHYRGIENNE.Bb3, GAMME_PHYRGIENNE.A3, GAMME_PHYRGIENNE.G4,
];

const KICK_DOJO = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1];

const HAT_DOJO = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

const SNARE_DOJO_TENSION = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];

const SNARE_DOJO_BACKBEAT = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];

const SNARE_DOJO_FILL = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1];

const MOTIFS_DOJO = {
  basse: [
    BASSE_DOJO_TENSION,
    BASSE_DOJO_TENSION,
    BASSE_DOJO_TENSION,
    BASSE_DOJO_TENSION,
    BASSE_DOJO_EXPLOSION,
    BASSE_DOJO_EXPLOSION,
    BASSE_DOJO_EXPLOSION,
    BASSE_DOJO_EXPLOSION,
  ],
  melodie: [MEL_DOJO_GRAVE, MEL_DOJO_GRAVE, MEL_DOJO_GRAVE, MEL_DOJO_GRAVE, MEL_DOJO_AIGU, MEL_DOJO_AIGU, MEL_DOJO_AIGU, MEL_DOJO_AIGU],
  arpege: [ARP_DOJO_SPARSE, ARP_DOJO_SPARSE, ARP_DOJO_SPARSE, ARP_DOJO_SPARSE, ARP_DOJO_RAPIDE, ARP_DOJO_RAPIDE, ARP_DOJO_RAPIDE, ARP_DOJO_RAPIDE],
  kick: repeter8(KICK_DOJO),
  hat: repeter8(HAT_DOJO),
  snare: [
    SNARE_DOJO_TENSION,
    SNARE_DOJO_TENSION,
    SNARE_DOJO_TENSION,
    SNARE_DOJO_TENSION,
    SNARE_DOJO_BACKBEAT,
    SNARE_DOJO_BACKBEAT,
    SNARE_DOJO_BACKBEAT,
    SNARE_DOJO_FILL,
  ],
};

/** Variantes par thème de page */
const THEMES = {
  HOME: {
    bpm: BPM_DEFAUT,
    facteurTempo: 1,
    basse: MOTIFS_COMMUNS.basseAmFED,
    melodie: MOTIFS_COMMUNS.melodieAABC,
    arpege: MOTIFS_COMMUNS.arpegeAABC,
    kick: MOTIFS_COMMUNS.kickStandard,
    hat: MOTIFS_COMMUNS.hatStandard,
    vibrato: true,
    doubleArpege: false,
  },
  WORK: {
    bpm: BPM_DEFAUT,
    facteurTempo: 1,
    basse: MOTIFS_COMMUNS.basseAmFED,
    melodie: MOTIFS_COMMUNS.melodieAABC,
    arpege: MOTIFS_COMMUNS.arpegeDouble8,
    kick: MOTIFS_COMMUNS.kickStandard,
    hat: MOTIFS_COMMUNS.hatStandard,
    vibrato: true,
    doubleArpege: true,
  },
  STATS: {
    bpm: BPM_DEFAUT,
    facteurTempo: 1,
    basse: MOTIFS_STATS.basse,
    melodie: null,
    arpege: null,
    kick: MOTIFS_STATS.kick,
    hat: MOTIFS_STATS.hat,
    nappe: MOTIFS_STATS.nappe,
    vibrato: false,
    doubleArpege: false,
  },
  STORY: {
    bpm: BPM_DEFAUT,
    facteurTempo: 1.28,
    basse: MOTIFS_STORY.basse,
    melodie: MOTIFS_STORY.melodie,
    arpege: MOTIFS_STORY.arpege,
    kick: null,
    hat: MOTIFS_STORY.hat,
    vibrato: true,
    doubleArpege: false,
  },
  DOJO: {
    bpm: BPM_DOJO,
    facteurTempo: 1,
    basse: MOTIFS_DOJO.basse,
    melodie: MOTIFS_DOJO.melodie,
    arpege: MOTIFS_DOJO.arpege,
    kick: MOTIFS_DOJO.kick,
    hat: MOTIFS_DOJO.hat,
    snare: MOTIFS_DOJO.snare,
    vibrato: false,
    doubleArpege: false,
  },
};

/**
 * Correspondance data-section-id (pages HTML) → thème musical.
 * Pages : accueil, projets, competences, parcours, dojo, contact, mentions
 */
const THEME_PAR_SECTION = {
  accueil: 'HOME',
  projets: 'WORK',
  competences: 'STATS',
  parcours: 'STORY',
  dojo: 'DOJO',
  contact: 'HOME',
  mentions: 'HOME',
};

/** Correspondance fichier HTML → thème (repli si section-id absent) */
const THEME_PAR_FICHIER = {
  'index.html': 'HOME',
  'projets.html': 'WORK',
  'competences.html': 'STATS',
  'parcours.html': 'STORY',
  'dojo.html': 'DOJO',
  'contact.html': 'HOME',
  'mentions-legales.html': 'HOME',
};

let ctxAudio = null;
let gainMaitre = null;
let bufferBruit = null;
let actif = false;
let pretDemarrer = false;
let minuteurPlanificateur = null;
let pasCourant = 0;
let prochainTempsAudio = 0;
let themeCourant = 'HOME';
let ecoutePremiereInteractionPosee = false;

/** Lit la préférence persistée (musique activée par l'utilisateur) */
function lirePreference() {
  try {
    return localStorage.getItem(CLE_PREF) === 'true';
  } catch {
    return false;
  }
}

/** Enregistre la préférence utilisateur */
function sauvegarderPreference(valeur) {
  try {
    localStorage.setItem(CLE_PREF, valeur ? 'true' : 'false');
  } catch {
    /* localStorage indisponible */
  }
}

/** Détecte le thème selon data-section-id ou l'URL */
function detecterTheme() {
  const sid = document.body?.dataset?.sectionId;
  let theme = 'HOME';

  if (sid && THEME_PAR_SECTION[sid]) {
    theme = THEME_PAR_SECTION[sid];
  } else {
    const fichier = window.location.pathname.split('/').pop() || 'index.html';
    theme = THEME_PAR_FICHIER[fichier] || 'HOME';
  }

  console.debug('[musique] thème détecté:', theme, sid ? `(section: ${sid})` : '');
  return theme;
}

/** Crée ou reprend le contexte audio (politique autoplay) */
function obtenirContexte() {
  try {
    if (!ctxAudio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctxAudio = new Ctx();
      gainMaitre = ctxAudio.createGain();
      gainMaitre.gain.value = VOLUME_MAITRE;
      gainMaitre.connect(ctxAudio.destination);
      bufferBruit = creerBufferBruit(ctxAudio);
    }
    return ctxAudio;
  } catch {
    return null;
  }
}

/** Buffer de bruit blanc réutilisable pour les percussions */
function creerBufferBruit(ctx) {
  const taille = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, taille, ctx.sampleRate);
  const donnees = buffer.getChannelData(0);
  for (let i = 0; i < taille; i += 1) {
    donnees[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Durée d'un pas (16e de note) selon le thème courant */
function dureePas() {
  const theme = THEMES[themeCourant] || THEMES.HOME;
  const battement = 60 / theme.bpm;
  return (battement / 4) * theme.facteurTempo;
}

/** Enveloppe ADSR courte sur un GainNode */
function appliquerEnveloppe(gain, debut, duree, amplitude) {
  const rel = Math.min(RELEASE_S, duree * 0.35);
  gain.gain.setValueAtTime(0, debut);
  gain.gain.linearRampToValueAtTime(amplitude, debut + ATTAQUE_S);
  gain.gain.setValueAtTime(amplitude, debut + duree - rel);
  gain.gain.linearRampToValueAtTime(0.0001, debut + duree);
}

/** Canal pulse (carré) — mélodie, arpège ou nappe */
function jouerPulse(freq, debut, duree, destination, opts = {}) {
  const ctx = ctxAudio;
  if (!ctx || !freq) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, debut);

  if (opts.vibrato) {
    const lfo = ctx.createOscillator();
    const profondeur = ctx.createGain();
    lfo.frequency.value = 5.5;
    profondeur.gain.value = 2.5;
    lfo.connect(profondeur);
    profondeur.connect(osc.frequency);
    lfo.start(debut);
    lfo.stop(debut + duree + 0.02);
  }

  appliquerEnveloppe(gain, debut, duree, opts.amp ?? 0.18);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(debut);
  osc.stop(debut + duree + 0.02);
}

/** Canal triangle — ligne de basse */
function jouerTriangle(freq, debut, duree, destination) {
  const ctx = ctxAudio;
  if (!ctx || !freq) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, debut);
  appliquerEnveloppe(gain, debut, duree, 0.22);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(debut);
  osc.stop(debut + duree + 0.02);
}

/** Kick — bruit filtré bas */
function jouerKick(debut, destination) {
  const ctx = ctxAudio;
  if (!ctx || !bufferBruit) return;

  const source = ctx.createBufferSource();
  source.buffer = bufferBruit;
  const filtre = ctx.createBiquadFilter();
  filtre.type = 'lowpass';
  filtre.frequency.setValueAtTime(200, debut);
  filtre.frequency.exponentialRampToValueAtTime(55, debut + 0.1);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.32, debut);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + 0.14);
  source.connect(filtre);
  filtre.connect(gain);
  gain.connect(destination);
  source.start(debut);
  source.stop(debut + 0.16);
}

/** Snare — bruit bandpass médium, décroissance rapide */
function jouerSnare(debut, destination) {
  const ctx = ctxAudio;
  if (!ctx || !bufferBruit) return;

  const source = ctx.createBufferSource();
  source.buffer = bufferBruit;
  const filtre = ctx.createBiquadFilter();
  filtre.type = 'bandpass';
  filtre.frequency.value = 1800;
  filtre.Q.value = 1;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, debut);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + 0.09);
  source.connect(filtre);
  filtre.connect(gain);
  gain.connect(destination);
  source.start(debut);
  source.stop(debut + 0.1);
}

/** Hat — bruit filtré aigu, très court */
function jouerHat(debut, destination, amplitude = 0.04) {
  const ctx = ctxAudio;
  if (!ctx || !bufferBruit) return;

  const source = ctx.createBufferSource();
  source.buffer = bufferBruit;
  const filtre = ctx.createBiquadFilter();
  filtre.type = 'highpass';
  filtre.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(amplitude, debut);
  gain.gain.exponentialRampToValueAtTime(0.0001, debut + 0.035);
  source.connect(filtre);
  filtre.connect(gain);
  gain.connect(destination);
  source.start(debut);
  source.stop(debut + 0.05);
}

/** Nappe discrète — pulse tenu sur une mesure entière */
function jouerNappe(freq, debut, duree, destination) {
  jouerPulse(freq, debut, duree * 0.96, destination, { amp: 0.05, vibrato: false });
}

/** Planifie un pas du séquenceur à un instant audio précis */
function planifierPas(pasGlobal, tempsAudio) {
  const theme = THEMES[themeCourant] || THEMES.HOME;
  const pasMesure = pasGlobal % PAS_PAR_MESURE;
  const mesure = Math.floor(pasGlobal / PAS_PAR_MESURE) % MESURES_PAR_BOUCLE;
  const duree = dureePas() * 0.92;
  const dureeMesure = dureePas() * PAS_PAR_MESURE;

  if (theme.nappe && pasMesure === 0) {
    const noteNappe = theme.nappe[mesure];
    if (noteNappe) jouerNappe(noteNappe, tempsAudio, dureeMesure, gainMaitre);
  }

  if (theme.basse) {
    const noteBasse = lireCellule(theme.basse, mesure, pasMesure);
    if (noteBasse) jouerTriangle(noteBasse, tempsAudio, duree, gainMaitre);
  }

  if (theme.melodie) {
    const noteMel = lireCellule(theme.melodie, mesure, pasMesure);
    if (noteMel) {
      jouerPulse(noteMel, tempsAudio, duree * 0.85, gainMaitre, {
        vibrato: theme.vibrato,
        amp: 0.14,
      });
    }
  }

  if (theme.arpege) {
    const noteArp = lireCellule(theme.arpege, mesure, pasMesure);
    if (noteArp) {
      const decalage = theme.doubleArpege ? 0 : dureePas() * 0.08;
      jouerPulse(noteArp, tempsAudio + decalage, duree * 0.7, gainMaitre, { amp: 0.1 });
      if (theme.doubleArpege && pasMesure % 2 === 0) {
        jouerPulse(noteArp * 1.5, tempsAudio + dureePas() * 0.04, duree * 0.55, gainMaitre, {
          amp: 0.07,
        });
      }
    }
  }

  if (theme.kick && lireCellule(theme.kick, mesure, pasMesure)) {
    jouerKick(tempsAudio, gainMaitre);
  }

  if (theme.snare && lireCellule(theme.snare, mesure, pasMesure)) {
    jouerSnare(tempsAudio, gainMaitre);
  }

  const hitHat = theme.hat ? lireCellule(theme.hat, mesure, pasMesure) : 0;
  if (hitHat) {
    const gainHat = hitHat === 2 ? 0.18 : themeCourant === 'STATS' ? 0.09 : 0.04;
    jouerHat(tempsAudio, gainMaitre, gainHat);
  }
}

/** Boucle de planification (lookahead) — jamais de setInterval */
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

/** Démarre le séquenceur */
function demarrerSequencuer() {
  const ctx = obtenirContexte();
  if (!ctx) return;

  pasCourant = 0;
  prochainTempsAudio = ctx.currentTime + 0.05;
  if (minuteurPlanificateur) clearTimeout(minuteurPlanificateur);
  bouclePlanification();
}

/** Arrête le séquenceur */
function arreterSequencuer() {
  if (minuteurPlanificateur) {
    clearTimeout(minuteurPlanificateur);
    minuteurPlanificateur = null;
  }
}

/** Met à jour l'apparence du bouton son */
function mettreAJourBouton(bouton) {
  if (!bouton) return;
  const libelle = bouton.querySelector('.nav__musique-libelle');
  if (actif) {
    bouton.dataset.etat = 'on';
    bouton.setAttribute('aria-pressed', 'true');
    bouton.setAttribute('aria-label', 'Couper la musique');
    if (libelle) libelle.textContent = 'ON';
    bouton.removeAttribute('title');
  } else if (pretDemarrer) {
    bouton.dataset.etat = 'pret';
    bouton.setAttribute('aria-pressed', 'false');
    bouton.setAttribute('aria-label', 'Musique prête — cliquez ou interagissez pour lancer');
    if (libelle) libelle.textContent = 'PRÊT';
    bouton.setAttribute('title', 'Musique prête — cliquez pour lancer');
  } else {
    bouton.dataset.etat = 'off';
    bouton.setAttribute('aria-pressed', 'false');
    bouton.setAttribute('aria-label', 'Activer la musique');
    if (libelle) libelle.textContent = '';
    bouton.setAttribute('title', 'Activer la musique arcade');
  }
}

/** Active la lecture musicale */
async function activerMusique() {
  const ctx = obtenirContexte();
  if (!ctx) return;

  try {
    await ctx.resume();
  } catch {
    return;
  }

  themeCourant = detecterTheme();
  actif = true;
  pretDemarrer = false;
  sauvegarderPreference(true);
  demarrerSequencuer();
  mettreAJourBouton(parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE));
}

/** Coupe la musique et suspend le contexte */
async function desactiverMusique() {
  actif = false;
  pretDemarrer = false;
  sauvegarderPreference(false);
  arreterSequencuer();
  mettreAJourBouton(parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE));

  if (ctxAudio?.state === 'running') {
    try {
      await ctxAudio.suspend();
    } catch {
      /* suspend refusé */
    }
  }
}

/** Bascule ON/OFF via le bouton navbar */
async function basculerMusique() {
  if (actif) {
    await desactiverMusique();
  } else {
    await activerMusique();
  }
}

/** Première interaction : relance si préférence « prêt » (hors clic bouton musique) */
function poserEcoutePremiereInteraction() {
  if (ecoutePremiereInteractionPosee) return;
  ecoutePremiereInteractionPosee = true;

  const tenterDemarrage = (evt) => {
    const bouton = parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE);
    if (bouton?.contains(evt.target)) return;
    if (pretDemarrer && !actif) activerMusique();
  };

  document.addEventListener('click', tenterDemarrage, { once: true, capture: true });
  document.addEventListener('keydown', tenterDemarrage, { once: true });
}

/** Bip discret sur les liens de nav (square wave courte) */
export function jouerBlipNavigation() {
  if (!actif) return;
  const ctx = obtenirContexte();
  if (!ctx || ctx.state !== 'running') return;

  const debut = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, debut);
  appliquerEnveloppe(gain, debut, 0.035, 0.06);
  osc.connect(gain);
  gain.connect(gainMaitre || ctx.destination);
  osc.start(debut);
  osc.stop(debut + 0.04);
}

/** Jingle de victoire — arpège ascendant rapide */
export function jouerJingleVictoire() {
  const ctx = obtenirContexte();
  if (!ctx) return;

  const notes = [GAMME.A4, GAMME.C5, GAMME.E5, GAMME.A4 * 2, GAMME.C5, GAMME.E5, GAMME.G5];
  const debut = ctx.currentTime + 0.02;
  notes.forEach((freq, i) => {
    jouerPulse(freq, debut + i * 0.07, 0.09, gainMaitre || ctx.destination, { amp: 0.2 });
  });
}

/** Jingle secret Konami — montée phrygienne flashy */
export function jouerJingleSecret() {
  const ctx = obtenirContexte();
  if (!ctx) return;

  const notes = [
    GAMME_PHYRGIENNE.A4,
    GAMME_PHYRGIENNE.Bb4,
    GAMME_PHYRGIENNE.C5,
    GAMME_PHYRGIENNE.E5,
    GAMME_PHYRGIENNE.F5,
    GAMME_PHYRGIENNE.A4 * 2,
  ];
  const debut = ctx.currentTime + 0.02;
  notes.forEach((freq, i) => {
    jouerPulse(freq, debut + i * 0.055, 0.1, gainMaitre || ctx.destination, { amp: 0.22 });
    if (i % 2 === 0) jouerKick(debut + i * 0.055, gainMaitre || ctx.destination);
  });
}

/** Indique si la musique de fond tourne */
export function estMusiqueActive() {
  return actif;
}

/** Change le thème à la volée (navigation sans rechargement si SPA — ici rechargement page) */
export function definirTheme(theme) {
  if (THEMES[theme]) themeCourant = theme;
}

/** Branche le bouton navbar et les interactions */
function brancherBoutonMusique() {
  const bouton = parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE);
  if (!bouton || bouton.dataset.branche) return;
  bouton.dataset.branche = 'true';

  const pref = lirePreference();
  if (pref) {
    pretDemarrer = true;
    poserEcoutePremiereInteraction();
  }

  themeCourant = detecterTheme();
  mettreAJourBouton(bouton);
  bouton.addEventListener('click', () => basculerMusique());
}

/** Bips au survol des liens de navigation */
function brancherBipsNavigation() {
  const menu = parId(CONFIGURATION.SELECTEURS.MENU);
  if (!menu || menu.dataset.bipsBranche) return;
  menu.dataset.bipsBranche = 'true';

  menu.querySelectorAll('.nav__bouton').forEach((lien) => {
    lien.addEventListener('mouseenter', jouerBlipNavigation);
  });
}

/** Point d'entrée — appelé depuis main.js après injection des partials */
export function initialiserMusique() {
  themeCourant = detecterTheme();
  brancherBoutonMusique();
  brancherBipsNavigation();
}
