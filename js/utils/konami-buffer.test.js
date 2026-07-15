import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    KONAMI: {
      SEQUENCE: [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ],
    },
  },
}));

import {
  enregistrerToucheKonami,
  prefixeKonamiActif,
  reinitialiserSaisieKonami,
} from './konami-buffer.js';

describe('konami-buffer', () => {
  beforeEach(() => {
    reinitialiserSaisieKonami();
  });

  it('signale un préfixe valide en cours de saisie', () => {
    enregistrerToucheKonami('ArrowUp');
    enregistrerToucheKonami('ArrowUp');
    expect(prefixeKonamiActif()).toBe(true);
  });

  it('invalide le préfixe après une touche erronée', () => {
    enregistrerToucheKonami('ArrowUp');
    enregistrerToucheKonami('ArrowDown');
    expect(prefixeKonamiActif()).toBe(false);
  });

  it('détecte la séquence complète', () => {
    const seq = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let complet = false;
    seq.forEach((key) => {
      complet = enregistrerToucheKonami(key);
    });
    expect(complet).toBe(true);
  });
});
