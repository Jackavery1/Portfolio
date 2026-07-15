import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

vi.mock('./recaptcha.js', () => ({
  reinitialiserWidgetRecaptcha: vi.fn(),
}));

import { ajouterScore } from './score.js';
import { reinitialiserWidgetRecaptcha } from './recaptcha.js';
import { finaliserEnvoiReussi } from './contact-form-submit-ui.js';
import { preparerDomEnvoi } from '../test-fixtures/contact-form-submit-fixtures.js';

describe('contact-form-submit-ui', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    preparerDomEnvoi();
  });

  it('finaliserEnvoiReussi affiche la confirmation et ajoute le score', () => {
    const btn = document.getElementById('btn');
    const confirmation = document.getElementById('confirm');

    finaliserEnvoiReussi({ btnEnvoyer: btn, confirmation });

    expect(confirmation.hidden).toBe(false);
    expect(btn.textContent).toBe('✓ ENVOYÉ');
    expect(btn.disabled).toBe(true);
    expect(ajouterScore).toHaveBeenCalledWith(500);
    expect(reinitialiserWidgetRecaptcha).toHaveBeenCalled();
  });

  it('finaliserEnvoiReussi peut laisser le bouton actif', () => {
    const btn = document.getElementById('btn');
    finaliserEnvoiReussi({ btnEnvoyer: btn, confirmation: null, desactiver: false });
    expect(btn.disabled).toBe(false);
  });
});
