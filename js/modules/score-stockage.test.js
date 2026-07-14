import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { SCORE: 'js-score' },
    STOCKAGE: { CLE_SCORE: 'portfolio-score' },
  },
}));

import { afficherScore, lireScore, sauvegarderScore } from './score-stockage.js';

describe('score-stockage', () => {
  beforeEach(() => {
    document.body.innerHTML = '<span id="js-score">000000</span>';
    sessionStorage.clear();
  });

  it('retourne 0 si sessionStorage vide', () => {
    expect(lireScore()).toBe(0);
  });

  it('corrige une valeur invalide en sessionStorage', () => {
    sessionStorage.setItem('portfolio-score', 'abc');
    expect(lireScore()).toBe(0);
    expect(sessionStorage.getItem('portfolio-score')).toBe('0');
  });

  it('plafonne le score à 9999', () => {
    sessionStorage.setItem('portfolio-score', '12000');
    expect(lireScore()).toBe(9999);
  });

  it('affiche le score formaté', () => {
    afficherScore(42);
    expect(document.getElementById('js-score').textContent).toBe('000042');
  });

  it('tolère sessionStorage indisponible', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(lireScore()).toBe(0);
    getItem.mockRestore();
  });

  it('ignore sauvegarderScore si sessionStorage échoue', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => sauvegarderScore(10)).not.toThrow();
    setItem.mockRestore();
  });
});
