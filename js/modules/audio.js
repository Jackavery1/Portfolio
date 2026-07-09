/* Bips arcade et fanfares — contexte Web Audio partagé (musique-audio.js) */

import { assurerContexteActif, obtenirGainMaitre } from './musique-audio.js';

function journaliserDebugAudio(message, err) {
  if (
    typeof location !== 'undefined' &&
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ) {
    console.debug(message, err);
  }
}

export function jouerBip(frequence = 440, duree = 60, type = 'square') {
  const ctx = assurerContexteActif();
  if (!ctx) return;
  const destination = obtenirGainMaitre() || ctx.destination;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequence, ctx.currentTime);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duree / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duree / 1000);
  } catch (err) {
    journaliserDebugAudio('[audio] Web Audio indisponible', err);
  }
}

function jouerSequenceBeeps(frequences, options = {}) {
  const delai = options.delai ?? 130;
  const duree = options.duree ?? 120;
  const type = options.type ?? 'square';
  const delais = options.delais;
  frequences.forEach((f, i) => {
    const t = delais != null ? delais[i] : i * delai;
    setTimeout(() => jouerBip(f, duree, type), t);
  });
}

export function jouerFanfareVictoire(options = {}) {
  jouerSequenceBeeps([523, 659, 784, 1047], {
    delai: options.delai ?? 100,
    duree: options.duree ?? 120,
    type: options.type ?? 'square',
    delais: options.delais,
  });
}
