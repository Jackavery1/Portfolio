/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../utils/contact-form-helpers.js', () => ({
  construireDonneesFormspree: vi.fn(() => new FormData()),
  libellerSujetSelect: vi.fn((text) => text?.trim() || ''),
  messageErreurCapture: vi.fn((err) => err?.message || 'Erreur'),
  messageErreurFormspree: vi.fn(() => 'Erreur serveur'),
}));

vi.mock('../utils/pii.js', () => ({
  decoderBase64Utf8: vi.fn((b64) => (b64 === 'dGVzdEBleGFtcGxlLmNvbQ==' ? 'test@example.com' : '')),
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

vi.mock('./recaptcha.js', () => ({
  obtenirTokenRecaptcha: vi.fn(),
  reinitialiserWidgetRecaptcha: vi.fn(),
}));

import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';
import { obtenirTokenRecaptcha, reinitialiserWidgetRecaptcha } from './recaptcha.js';
import {
  envoyerViaFormspree,
  envoyerViaMailto,
  finaliserEnvoiReussi,
  lireSujetUtile,
} from './contact-form-submit.js';

describe('contact-form-submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <button id="btn">Envoyer</button>
      <p id="confirm" hidden>OK</p>
    `;
  });

  it('lireSujetUtile retourne le libellé de l’option sélectionnée', () => {
    const select = document.createElement('select');
    select.innerHTML = '<option>Projet</option><option selected>Stage</option>';
    select.selectedIndex = 1;

    expect(lireSujetUtile(select)).toBe('Stage');
  });

  it('envoyerViaMailto ouvre un mailto si email configuré', () => {
    const original = window.location;
    delete window.location;
    window.location = { href: '' };

    const ok = envoyerViaMailto({
      config: { CONTACT: { EMAIL_B64: 'dGVzdEBleGFtcGxlLmNvbQ==' } },
      champs: { nom: 'Joris', email: 'joris@example.com', message: 'Salut' },
      sujetUtile: 'Projet',
    });

    expect(ok).toBe(true);
    expect(window.location.href).toContain('mailto:test@example.com');

    window.location = original;
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

  it('envoyerViaFormspree retourne ok si Formspree répond 200', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    );

    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    const result = await envoyerViaFormspree({
      config: {
        CONTACT: {
          RECAPTCHA_SITE_KEY: 'key',
          FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
          RECAPTCHA_VERSION: 3,
        },
      },
      champs: { nom: 'Joris', email: 'a@b.c', message: 'Hi' },
      sujetUtile: 'Projet',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(result).toEqual({ ok: true });
    expect(afficherErreur).not.toHaveBeenCalled();
  });

  it('envoyerViaFormspree affiche ENVOI… pendant l’envoi', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    let resolveFetch;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );

    const btn = document.getElementById('btn');
    btn.textContent = '► ENVOYER LE MESSAGE';
    const afficherErreur = vi.fn();

    const envoi = envoyerViaFormspree({
      config: {
        CONTACT: {
          RECAPTCHA_SITE_KEY: 'key',
          FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
          RECAPTCHA_VERSION: 3,
        },
      },
      champs: { nom: 'Joris', email: 'a@b.c', message: 'Hi' },
      sujetUtile: 'Projet',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    await Promise.resolve();
    expect(btn.textContent).toBe('ENVOI…');
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.classList.contains('bouton-envoyer--chargement')).toBe(true);
    expect(btn.disabled).toBe(true);

    resolveFetch({ ok: true, json: () => Promise.resolve({}) });
    await envoi;
  });

  it('envoyerViaFormspree affiche une erreur si reCAPTCHA échoue', async () => {
    obtenirTokenRecaptcha.mockRejectedValue(new Error('captcha'));

    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    await envoyerViaFormspree({
      config: {
        CONTACT: {
          RECAPTCHA_SITE_KEY: 'key',
          FORMSPREE_ENDPOINT: 'https://formspree.io/f/test',
          RECAPTCHA_VERSION: 3,
        },
      },
      champs: { nom: 'Joris', email: 'a@b.c', message: 'Hi' },
      sujetUtile: '',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(btn.disabled).toBe(false);
    expect(jouerBip).toHaveBeenCalled();
    expect(afficherErreur).toHaveBeenCalledWith('captcha');
  });
});
