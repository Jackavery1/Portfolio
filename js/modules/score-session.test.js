/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { SCORE: 'js-score' },
    STOCKAGE: { CLE_SCORE: 'portfolio-score', PREFIXE_PROJET: 'jm_projet_' },
    BONUS_SCORE: { PROJET: 600 },
  },
}));

vi.mock('./musique.js', () => ({
  jouerJingleVictoire: vi.fn(),
}));

import { afficherScore, ajouterScore, accorderBonusProjet, accorderBonusSession, lireScore, sauvegarderScore } from './score-session.js';

describe('score-session', () => {
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

  it('ajoute des points et met à jour l’affichage', () => {
    sauvegarderScore(100);
    ajouterScore(50);
    expect(lireScore()).toBe(150);
    expect(document.getElementById('js-score').textContent).toBe('000150');
  });

  it('n’ajoute plus de points au maximum', () => {
    sauvegarderScore(9999);
    afficherScore(9999);
    ajouterScore(10);
    expect(lireScore()).toBe(9999);
    expect(document.getElementById('js-score').textContent).toBe('009999');
  });

  it('accorde un bonus session une seule fois', () => {
    sauvegarderScore(0);
    expect(accorderBonusSession('bonus-test', 100)).toBe(true);
    expect(lireScore()).toBe(100);
    expect(accorderBonusSession('bonus-test', 100)).toBe(false);
    expect(lireScore()).toBe(100);
  });

  it('accorde un bonus projet au premier clic', () => {
    sauvegarderScore(0);
    expect(accorderBonusProjet('lsf')).toBe(true);
    expect(lireScore()).toBe(600);
    expect(accorderBonusProjet('lsf')).toBe(false);
    expect(lireScore()).toBe(600);
  });

  it('tolère sessionStorage indisponible à la lecture', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(lireScore()).toBe(0);
    getItem.mockRestore();
  });
});
