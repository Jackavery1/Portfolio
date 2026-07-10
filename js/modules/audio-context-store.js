/** État mutable du moteur Web Audio — isolé pour testabilité. */

export const VOLUME_MAITRE = 0.07;

const etat = {
  ctxAudio: null,
  gainMaitre: null,
  bufferBruit: null,
};

export function lireEtatAudio() {
  return etat;
}

export function reinitialiserEtatAudio() {
  etat.ctxAudio = null;
  etat.gainMaitre = null;
  etat.bufferBruit = null;
}

export function initialiserContexteAudio(Ctx, creerBufferBruit) {
  if (!Ctx) return null;
  etat.ctxAudio = new Ctx();
  etat.gainMaitre = etat.ctxAudio.createGain();
  etat.gainMaitre.gain.value = VOLUME_MAITRE;
  etat.gainMaitre.connect(etat.ctxAudio.destination);
  etat.bufferBruit = creerBufferBruit(etat.ctxAudio);
  return etat.ctxAudio;
}
