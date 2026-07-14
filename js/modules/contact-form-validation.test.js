import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    CONTACT: { LIMITES: { nom: 80, email: 120, message: 2000 } },
    SELECTEURS: {
      CONTACT_NOM: 'js-contact-nom',
      CONTACT_EMAIL: 'js-contact-email',
      CONTACT_MESSAGE: 'js-contact-message',
    },
  },
}));

import {
  champsFormulaireValides,
  construireErreursValidation,
  lireChampsFormulaire,
} from './contact-form-validation.js';

describe('contact-form-validation', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="js-contact-nom" value="Joris" />
      <input id="js-contact-email" value="test@example.com" />
      <textarea id="js-contact-message">Bonjour</textarea>
    `;
  });

  it('lit les champs du formulaire', () => {
    const champs = lireChampsFormulaire();
    expect(champs.nom).toBe('Joris');
    expect(champs.email).toBe('test@example.com');
    expect(champs.message).toBe('Bonjour');
    expect(champs.champsDom).toHaveLength(3);
  });

  it('valide des champs complets', () => {
    const champs = lireChampsFormulaire();
    expect(champsFormulaireValides(champs)).toBe(true);
    expect(construireErreursValidation(champs)).toEqual([]);
  });

  it('signale les champs manquants', () => {
    document.getElementById('js-contact-nom').value = '';
    document.getElementById('js-contact-email').value = '';
    document.getElementById('js-contact-message').value = '';

    const champs = lireChampsFormulaire();
    const erreurs = construireErreursValidation(champs);

    expect(champsFormulaireValides(champs)).toBeFalsy();
    expect(erreurs).toHaveLength(3);
    expect(erreurs[0].message).toContain('nom');
    expect(erreurs[1].message).toContain('e-mail');
    expect(erreurs[2].message).toContain('message');
  });

  it('signale un email invalide', () => {
    document.getElementById('js-contact-email').value = 'pas-un-email';
    const champs = lireChampsFormulaire();
    const erreurs = construireErreursValidation(champs);

    expect(erreurs).toHaveLength(1);
    expect(erreurs[0].message).toContain('invalide');
  });
});
