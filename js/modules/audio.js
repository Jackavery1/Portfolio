/* ============================================
   Sons Web Audio API (bips arcade)
   ============================================ */

let ctxAudio = null;

function obtenirContexteAudio() {
  try {
    if (!ctxAudio) {
      ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxAudio.state === 'suspended') {
      ctxAudio.resume().catch(() => {});
    }
    return ctxAudio;
  } catch {
    return null;
  }
}

export function jouerBip(frequence = 440, duree = 60, type = 'square') {
  const ctx = obtenirContexteAudio();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequence, ctx.currentTime);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duree / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duree / 1000);
  } catch (err) {
    if (
      typeof location !== 'undefined' &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ) {
      console.debug('[audio] Web Audio indisponible', err);
    }
  }
}

/** Suite de bips espacés (ex. fanfare Konami) */
export function jouerSequenceBeeps(frequences, opts = {}) {
  const delai = opts.delai ?? 130;
  const duree = opts.duree ?? 120;
  const type = opts.type ?? 'square';
  const delais = opts.delais;
  frequences.forEach((f, i) => {
    const t = delais != null ? delais[i] : i * delai;
    setTimeout(() => jouerBip(f, duree, type), t);
  });
}

export const FANFARE_VICTOIRE = [523, 659, 784, 1047];

/** Fanfare arcade standard (high score, Konami, boss vaincu) */
export function jouerFanfareVictoire(opts = {}) {
  jouerSequenceBeeps(FANFARE_VICTOIRE, {
    delai: opts.delai ?? 100,
    duree: opts.duree ?? 120,
    type: opts.type ?? 'square',
    delais: opts.delais,
  });
}
