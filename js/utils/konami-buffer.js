import { CONFIGURATION } from '../config/index.js';

let saisieKonami = [];

export function reinitialiserSaisieKonami() {
  saisieKonami = [];
}

export function prefixeKonamiActif() {
  const seq = CONFIGURATION.KONAMI.SEQUENCE;
  if (saisieKonami.length === 0) return false;
  return saisieKonami.every((key, index) => key === seq[index]);
}

export function enregistrerToucheKonami(key) {
  const seq = CONFIGURATION.KONAMI.SEQUENCE;
  saisieKonami.push(key);
  if (saisieKonami.length > seq.length) saisieKonami.shift();
  return saisieKonami.join(',') === seq.join(',');
}
