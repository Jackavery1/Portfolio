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
import {
  finaliserEnvoiReussi,
  marquerEnvoiEnCours,
  restaurerBoutonEnvoi,
  signalerEchecEnvoi,
} from './contact-form-submit-ui.js';
import { preparerDomEnvoi } from '../test-fixtures/contact-form-submit-fixtures.js';
import { jouerBip } from './audio.js';

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

  it('marquerEnvoiEnCours désactive les champs du formulaire', () => {
    const btn = document.getElementById('btn');
    marquerEnvoiEnCours(btn);

    expect(btn.disabled).toBe(true);
    expect(document.getElementById('contact-nom').disabled).toBe(true);
    expect(document.getElementById('contact-email').disabled).toBe(true);
    expect(document.getElementById('contact-sujet').disabled).toBe(true);
    expect(document.getElementById('contact-message').disabled).toBe(true);
    expect(btn.form?.getAttribute('aria-busy')).toBe('true');
  });

  it('restaurerBoutonEnvoi réactive les champs du formulaire', () => {
    const btn = document.getElementById('btn');
    marquerEnvoiEnCours(btn);
    restaurerBoutonEnvoi(btn, '► ENVOYER');

    expect(btn.disabled).toBe(false);
    expect(document.getElementById('contact-nom').disabled).toBe(false);
    expect(document.getElementById('contact-message').disabled).toBe(false);
    expect(btn.textContent).toBe('► ENVOYER');
  });

  it('signalerEchecEnvoi restaure le bouton et affiche l’erreur', () => {
    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();
    marquerEnvoiEnCours(btn);

    signalerEchecEnvoi({
      btnEnvoyer: btn,
      labelEnvoyer: '► ENVOYER',
      msg: 'Échec réseau',
      afficherErreur,
    });

    expect(jouerBip).toHaveBeenCalled();
    expect(btn.disabled).toBe(false);
    expect(btn.textContent).toBe('► ENVOYER');
    expect(btn.getAttribute('title')).toBe('Échec réseau');
    expect(afficherErreur).toHaveBeenCalledWith('Échec réseau');
    expect(reinitialiserWidgetRecaptcha).not.toHaveBeenCalled();
  });

  it('signalerEchecEnvoi peut réinitialiser reCAPTCHA', () => {
    const btn = document.getElementById('btn');
    signalerEchecEnvoi({
      btnEnvoyer: btn,
      labelEnvoyer: '► ENVOYER',
      msg: 'Erreur',
      afficherErreur: vi.fn(),
      reinitialiserRecaptcha: true,
    });
    expect(reinitialiserWidgetRecaptcha).toHaveBeenCalled();
  });

  it('signalerEchecEnvoi tolère un bouton hors formulaire', () => {
    const btn = document.createElement('button');
    btn.textContent = 'OK';
    document.body.appendChild(btn);
    const afficherErreur = vi.fn();

    signalerEchecEnvoi({
      btnEnvoyer: btn,
      labelEnvoyer: 'OK',
      msg: 'Erreur',
      afficherErreur,
    });

    expect(btn.disabled).toBe(false);
    expect(afficherErreur).toHaveBeenCalledWith('Erreur');
  });
});
