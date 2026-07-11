import { describe, expect, it } from 'vitest';
import { CONFIGURATION } from './index.js';
import { PROJETS } from './projects.js';

describe('CONFIGURATION', () => {
  it('expose toutes les sections du barrel', () => {
    expect(Object.keys(CONFIGURATION).sort()).toEqual(
      [
        'BONUS_SCORE',
        'CONTACT',
        'KONAMI',
        'NAVIGATION',
        'PARTIELS',
        'PERSON_NAME',
        'SELECTEURS',
        'SITE_ORIGIN',
        'SOCIAL',
        'STOCKAGE',
      ].sort()
    );
  });

  it('expose les sections attendues', () => {
    expect(CONFIGURATION.SITE_ORIGIN).toMatch(/^https:\/\//);
    expect(CONFIGURATION.SOCIAL.GITHUB).toContain('github.com');
    expect(CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT).toContain('formspree.io');
    expect(CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY.length).toBeGreaterThan(10);
    expect(CONFIGURATION.NAVIGATION.ORDRE).toContain('index.html');
    expect(CONFIGURATION.PARTIELS.length).toBeGreaterThan(0);
    expect(PROJETS.lsf?.titre).toBe('PROJET LSF');
    expect(PROJETS.derniereligne?.num).toBe('PRJ-03');
    expect(CONFIGURATION.SELECTEURS.MODALE).toBe('js-modal');
    expect(CONFIGURATION.BONUS_SCORE.PAGE).toBe(200);
    expect(CONFIGURATION.BONUS_SCORE.PROJET).toBe(600);
    expect(CONFIGURATION.BONUS_SCORE.BOSS_DOJO).toBe(300);
    expect(CONFIGURATION.BONUS_SCORE.BOSS_DOJO_VAINCU).toBe(450);
    expect(CONFIGURATION.BONUS_SCORE.CONTACT).toBe(500);
    expect(CONFIGURATION.BONUS_SCORE.GITHUB).toBe(500);
  });

  it('définit le code Konami et les clés localStorage', () => {
    expect(CONFIGURATION.KONAMI.SEQUENCE).toEqual([
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
    ]);
    expect(CONFIGURATION.STOCKAGE.CLE_SCORE).toBe('jm_portfolio_score');
    expect(CONFIGURATION.STOCKAGE.CLE_MUSIQUE).toBe('portfolio_musique_active');
    expect(CONFIGURATION.STOCKAGE.PREFIXE_DOJO_BOSS).toBe('jm_dojo_boss_');
  });
});
