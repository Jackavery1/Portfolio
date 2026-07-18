import { describe, expect, it } from 'vitest';
import { STOCKAGE } from './storage.js';

describe('STOCKAGE', () => {
  it('préfixe les clés localStorage du portfolio', () => {
    expect(STOCKAGE.CLE_SCORE).toMatch(/^jm_/);
    expect(STOCKAGE.PREFIXE_PAGE).toBe('jm_page_');
    expect(STOCKAGE.PREFIXE_PROJET).toBe('jm_projet_');
    expect(STOCKAGE.PREFIXE_DOJO_BOSS).toBe('jm_dojo_boss_');
  });

  it('isole les clés fonctionnelles (musique, contact)', () => {
    expect(STOCKAGE.CLE_MUSIQUE).toBe('portfolio_musique_active');
    expect(STOCKAGE.DERNIERE_SOUMISSION_CONTACT).toBe('jm_contact_last_submit');
  });

  it('n’utilise pas de valeurs vides', () => {
    Object.values(STOCKAGE).forEach((valeur) => {
      expect(valeur).toBeTruthy();
      expect(typeof valeur).toBe('string');
    });
  });
});
