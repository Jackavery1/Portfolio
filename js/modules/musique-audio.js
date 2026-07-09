/* Moteur Web Audio partagé — contexte unique, chiptune et bips UI */

const VOLUME_MAITRE = 0.07;
const ATTAQUE_S = 0.005;
const RELEASE_S = 0.04;

let ctxAudio = null;
let gainMaitre = null;
let bufferBruit = null;

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

export function reprendreContexteSiSuspendu() {
  if (ctxAudio?.state === 'suspended') {
    ctxAudio.resume().catch((err) => journaliserDebugAudio('[audio] reprise AudioContext refusée', err));
  }
}

export function obtenirContexte() {
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

/** Contexte prêt pour la lecture (reprise automatique si suspendu). */
export function assurerContexteActif() {
  const ctx = obtenirContexte();
  if (ctx) reprendreContexteSiSuspendu();
  return ctx;
}

export function obtenirGainMaitre() {
  obtenirContexte();
  return gainMaitre;
}

export function obtenirEtatContexte() {
  return ctxAudio?.state;
}

export async function suspendreContexte() {
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

export function jouerPulse(frequence, debut, duree, destination, options = {}) {
  const ctx = ctxAudio;
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
  const ctx = ctxAudio;
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

export function jouerSnare(debut, destination) {
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

export function jouerHat(debut, destination, amplitude = 0.04) {
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

export function jouerNappe(frequence, debut, duree, destination) {
  jouerPulse(frequence, debut, duree * 0.96, destination, { amplitude: 0.05, vibrato: false });
}

export function jouerBlip(debut, destination, frequence = 880, duree = 0.035, amplitude = 0.06) {
  const ctx = ctxAudio;
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
