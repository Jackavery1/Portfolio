import { describe, expect, it } from 'vitest';
import { CONFIG } from './index.js';

describe('CONFIG', () => {
  it('expose les sections attendues', () => {
    expect(CONFIG.SITE_ORIGIN).toMatch(/^https:\/\//);
    expect(CONFIG.SOCIAL.GITHUB).toContain('github.com');
    expect(CONFIG.CONTACT.FORMSPREE_ENDPOINT).toContain('formspree.io');
    expect(CONFIG.CONTACT.RECAPTCHA_SITE_KEY.length).toBeGreaterThan(10);
    expect(CONFIG.NAVIGATION.ORDER).toContain('index.html');
    expect(CONFIG.PARTIALS.length).toBeGreaterThan(0);
    expect(CONFIG.PROJETS.lsf?.titre).toBe('PROJET LSF');
    expect(CONFIG.PROJETS.derniereligne?.num).toBe('PRJ-03');
    expect(CONFIG.SELECTORS.MODAL).toBe('js-modal');
    expect(CONFIG.SCORE_BONUS.PROJET).toBe(600);
  });
});
