import { describe, expect, it } from 'vitest';
import { CONFIGURATION } from './index.js';

describe('CONFIGURATION', () => {
  it('expose les sections attendues', () => {
    expect(CONFIGURATION.SITE_ORIGIN).toMatch(/^https:\/\//);
    expect(CONFIGURATION.SOCIAL.GITHUB).toContain('github.com');
    expect(CONFIGURATION.CONTACT.FORMSPREE_ENDPOINT).toContain('formspree.io');
    expect(CONFIGURATION.CONTACT.RECAPTCHA_SITE_KEY.length).toBeGreaterThan(10);
    expect(CONFIGURATION.NAVIGATION.ORDRE).toContain('index.html');
    expect(CONFIGURATION.PARTIELS.length).toBeGreaterThan(0);
    expect(CONFIGURATION.PROJETS.lsf?.titre).toBe('PROJET LSF');
    expect(CONFIGURATION.PROJETS.derniereligne?.num).toBe('PRJ-03');
    expect(CONFIGURATION.SELECTEURS.MODALE).toBe('js-modal');
    expect(CONFIGURATION.BONUS_SCORE.PAGE).toBe(200);
    expect(CONFIGURATION.BONUS_SCORE.PROJET).toBe(600);
    expect(CONFIGURATION.BONUS_SCORE.BOSS_DOJO).toBe(300);
    expect(CONFIGURATION.BONUS_SCORE.BOSS_DOJO_VAINCU).toBe(450);
    expect(CONFIGURATION.BONUS_SCORE.CONTACT).toBe(500);
    expect(CONFIGURATION.BONUS_SCORE.GITHUB).toBe(500);
  });
});
