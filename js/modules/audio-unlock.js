/** Déverrouille AudioContext pendant un geste utilisateur (sync, avant tout await). */

import { initialiserContexteAudio, lireEtatAudio } from './audio-context-store.js';

function creerBufferBruit(ctx) {
  const taille = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, taille, ctx.sampleRate);
  const donnees = buffer.getChannelData(0);
  for (let i = 0; i < taille; i += 1) {
    donnees[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function deverrouillerAudioAuGeste() {
  try {
    let { ctxAudio } = lireEtatAudio();
    if (!ctxAudio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      ctxAudio = initialiserContexteAudio(Ctx, creerBufferBruit);
    }
    if (ctxAudio?.state === 'suspended') {
      void ctxAudio.resume();
    }
    return ctxAudio;
  } catch {
    return null;
  }
}
