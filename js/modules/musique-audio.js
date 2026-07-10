/* Moteur Web Audio partagé — chiptune et bips UI */

import {
  initialiserContexteAudio,
  lireEtatAudio,
  reinitialiserEtatAudio,
} from './audio-context-store.js';

const ATTAQUE_S = 0.005;
const RELEASE_S = 0.04;

function journaliserDebugAudio(message, err) {
  if (
    typeof location !== 'undefined' &&
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ) {
    console.debug(message, err);
  }
}

function creerBufferBruit(ctx) {
  const taille = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, taille, ctx.sampleRate);
  const donnees = buffer.getChannelData(0);
  for (let i = 0; i < taille; i += 1) {
    donnees[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export { reinitialiserEtatAudio };

export function reprendreContexteSiSuspendu() {
  const { ctxAudio } = lireEtatAudio();
  if (ctxAudio?.state === 'suspended') {
    ctxAudio
      .resume()
      .catch((err) => journaliserDebugAudio('[audio] reprise AudioContext refusée', err));
  }
}

export function obtenirContexte() {
  try {
    const { ctxAudio } = lireEtatAudio();
    if (ctxAudio) return ctxAudio;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    return initialiserContexteAudio(Ctx, creerBufferBruit);
  } catch {
    return null;
  }
}

export function assurerContexteActif() {
  const ctx = obtenirContexte();
  if (ctx) reprendreContexteSiSuspendu();
  return ctx;
}

export function obtenirGainMaitre() {
  obtenirContexte();
  return lireEtatAudio().gainMaitre;
}

export function obtenirEtatContexte() {
  return lireEtatAudio().ctxAudio?.state;
}

export async function suspendreContexte() {
  const { ctxAudio } = lireEtatAudio();
  if (ctxAudio?.state === 'running') {
    try {
      await ctxAudio.suspend();
    } catch {
      /* suspend refusé */
    }
  }
}

function appliquerEnveloppe(gain, debut, duree, amplitude) {
  const rel = Math.min(RELEASE_S, duree * 0.35);
  gain.gain.setValueAtTime(0, debut);
  gain.gain.linearRampToValueAtTime(amplitude, debut + ATTAQUE_S);
  gain.gain.setValueAtTime(amplitude, debut + duree - rel);
  gain.gain.linearRampToValueAtTime(0.0001, debut + duree);
}

function lireCtx() {
  return lireEtatAudio().ctxAudio;
}

function lireBufferBruit() {
  return lireEtatAudio().bufferBruit;
}

export function jouerPulse(frequence, debut, duree, destination, options = {}) {
  const ctx = lireCtx();
  if (!ctx || !frequence) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(frequence, debut);

  if (options.vibrato) {
    const lfo = ctx.createOscillator();
    const profondeur = ctx.createGain();
    lfo.frequency.value = 5.5;
    profondeur.gain.value = 2.5;
    lfo.connect(profondeur);
    profondeur.connect(osc.frequency);
    lfo.start(debut);
    lfo.stop(debut + duree + 0.02);
  }

  appliquerEnveloppe(gain, debut, duree, options.amplitude ?? 0.18);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(debut);
  osc.stop(debut + duree + 0.02);
}

export function jouerTriangle(frequence, debut, duree, destination) {
  const ctx = lireCtx();
  if (!ctx || !frequence) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequence, debut);
  appliquerEnveloppe(gain, debut, duree, 0.22);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(debut);
  osc.stop(debut + duree + 0.02);
}

export function jouerKick(debut, destination) {
  const ctx = lireCtx();
  const bufferBruit = lireBufferBruit();
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

export function jouerSnare(debut, destination) {
  const ctx = lireCtx();
  const bufferBruit = lireBufferBruit();
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

export function jouerHat(debut, destination, amplitude = 0.04) {
  const ctx = lireCtx();
  const bufferBruit = lireBufferBruit();
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

export function jouerNappe(frequence, debut, duree, destination) {
  jouerPulse(frequence, debut, duree * 0.96, destination, { amplitude: 0.05, vibrato: false });
}

export function jouerBlip(debut, destination, frequence = 880, duree = 0.035, amplitude = 0.06) {
  const ctx = lireCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(frequence, debut);
  appliquerEnveloppe(gain, debut, duree, amplitude);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(debut);
  osc.stop(debut + duree + 0.005);
}
