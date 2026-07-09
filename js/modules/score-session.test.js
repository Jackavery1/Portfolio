/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { SCORE: 'js-score' },
    STOCKAGE: { CLE_SCORE: 'portfolio-score', PREFIXE_PROJET: 'jm_projet_' },
    BONUS_SCORE: { PROJET: 600 },
  },
}));

vi.mock('./musique-loader.js', () => ({
  jouerJingleVictoire: vi.fn(),
}));

import {
  ajouterScore,
  accorderBonusProjet,
  afficherScore,
  lireScore,
  sauvegarderScore,
} from './score-session.js';

describe('score-session', () => {
  beforeEach(() => {
    document.body.innerHTML = '<span id="js-score">000000</span>';
    sessionStorage.clear();
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

  it('accorde un bonus projet une seule fois par session', () => {
    sauvegarderScore(0);
    expect(accorderBonusProjet('lsf')).toBe(true);
    expect(lireScore()).toBe(600);
    expect(accorderBonusProjet('lsf')).toBe(false);
    expect(lireScore()).toBe(600);
  });

  it('accorde un bonus dojo boss vaincu', () => {
    vi.resetModules();
    vi.doMock('../config/index.js', () => ({
      CONFIGURATION: {
        SELECTEURS: { SCORE: 'js-score' },
        STOCKAGE: { CLE_SCORE: 'portfolio-score', PREFIXE_DOJO_BOSS: 'jm_dojo_' },
        BONUS_SCORE: { BOSS_DOJO: 100, BOSS_DOJO_VAINCU: 500 },
      },
    }));
    return import('./score-session.js').then(({ accorderBonusDojoBoss, lireScore, sauvegarderScore }) => {
      sauvegarderScore(0);
      expect(accorderBonusDojoBoss('boss-1', false)).toBe(true);
      expect(lireScore()).toBe(100);
      expect(accorderBonusDojoBoss('boss-1', true)).toBe(false);
      expect(accorderBonusDojoBoss('boss-2', true)).toBe(true);
      expect(lireScore()).toBe(600);
    });
  });

  it('refuse un bonus projet sans identifiant', () => {
    expect(accorderBonusProjet('')).toBe(false);
    expect(accorderBonusProjet(null)).toBe(false);
  });

  it('accorde le bonus même si sessionStorage est indisponible', () => {
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    sauvegarderScore(0);
    expect(accorderBonusProjet('fallback')).toBe(true);
    expect(lireScore()).toBe(600);
  });

  it('déclenche le popup au score maximum', async () => {
    vi.resetModules();
    vi.useFakeTimers();
    const afficherPopupMeilleurScore = vi.fn();
    vi.doMock('./popup-highscore.js', () => ({
      afficherPopupMeilleurScore,
    }));
    vi.doMock('../config/index.js', () => ({
      CONFIGURATION: {
        SELECTEURS: { SCORE: 'js-score' },
        STOCKAGE: { CLE_SCORE: 'portfolio-score', PREFIXE_PROJET: 'jm_projet_' },
        BONUS_SCORE: { PROJET: 600 },
      },
    }));
    vi.doMock('./musique-loader.js', () => ({
      jouerJingleVictoire: vi.fn(),
    }));
    document.body.innerHTML = '<span id="js-score">000000</span>';
    const { ajouterScore, sauvegarderScore } = await import('./score-session.js');
    sauvegarderScore(9990);
    ajouterScore(20);
    await vi.advanceTimersByTimeAsync(600);
    expect(afficherPopupMeilleurScore).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
