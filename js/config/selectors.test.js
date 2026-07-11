import { describe, expect, it } from 'vitest';
import { SELECTEURS } from './selectors.js';

describe('SELECTEURS', () => {
  it('expose des identifiants DOM stables pour le shell et les modales', () => {
    expect(SELECTEURS.SCORE).toBe('js-score');
    expect(SELECTEURS.MODALE).toBe('js-modal');
    expect(SELECTEURS.BURGER).toBe('js-burger');
    expect(SELECTEURS.BOUTON_MUSIQUE).toBe('js-bouton-musique');
    expect(SELECTEURS.FORMULAIRE).toBe('js-formulaire');
  });

  it('aligne les champs contact sur les ids HTML du formulaire', () => {
    expect(SELECTEURS.CONTACT_NOM).toBe('contact-nom');
    expect(SELECTEURS.CONTACT_EMAIL).toBe('contact-email');
    expect(SELECTEURS.CONTACT_MESSAGE).toBe('contact-message');
    expect(SELECTEURS.CONTACT_HONEYPOT).toBe('contact-website');
  });

  it('n’utilise pas de valeurs vides', () => {
    Object.values(SELECTEURS).forEach((valeur) => {
      expect(valeur).toBeTruthy();
      expect(typeof valeur).toBe('string');
    });
  });
});
