/* Moteur Web Audio partagé — contexte, gain maître ; voix dans musique-voix.js */

import {
  initialiserContexteAudio,
  lireEtatAudio,
  reinitialiserEtatAudio,
} from './audio-context-store.js';

export {
  jouerBlip,
  jouerHat,
  jouerKick,
  jouerNappe,
  jouerPulse,
  jouerSnare,
  jouerTriangle,
} from './musique-voix.js';

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
    Promise.resolve(ctxAudio.resume()).catch((err) =>
      journaliserDebugAudio('[audio] reprise AudioContext refusée', err)
    );
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
