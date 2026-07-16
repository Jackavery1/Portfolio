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

vi.mock('./recaptcha.js', () => ({
  obtenirTokenRecaptcha: vi.fn(),
}));

import { obtenirTokenRecaptcha } from './recaptcha.js';
import { envoyerViaFormspree, envoyerViaMailto, lireSujetUtile } from './contact-form-submit.js';
import {
  champsContactDemo,
  configurationFormspree,
  preparerDomEnvoi,
} from '../test-fixtures/contact-form-submit-fixtures.js';

describe('contact-form-submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    preparerDomEnvoi();
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
      configuration: { CONTACT: { EMAIL_B64: 'dGVzdEBleGFtcGxlLmNvbQ==' } },
      champs: { nom: 'Joris', email: 'joris@example.com', message: 'Salut' },
      sujetUtile: 'Projet',
    });

    expect(ok).toBe(true);
    expect(window.location.href).toContain('mailto:test@example.com');

    window.location = original;
  });

  it('envoyerViaMailto retourne false sans email configuré', () => {
    expect(
      envoyerViaMailto({
        configuration: { CONTACT: { EMAIL_B64: '' } },
        champs: champsContactDemo,
        sujetUtile: '',
      })
    ).toBe(false);
  });

  it('envoyerViaFormspree retourne ok si Formspree répond 200', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
    );

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: 'Projet',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({ ok: true });
  });

  it('envoyerViaFormspree retourne l’erreur reCAPTCHA', async () => {
    obtenirTokenRecaptcha.mockRejectedValue(new Error('captcha'));

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({ ok: false, msg: 'captcha' });
  });

  it('envoyerViaFormspree refuse l’envoi sans clé reCAPTCHA', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree({ CONTACT: { RECAPTCHA_SITE_KEY: '' } }),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({ ok: false, code: 'sans-cle' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envoyerViaFormspree demande la case v2 si le jeton est vide', async () => {
    obtenirTokenRecaptcha.mockResolvedValue(null);

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree({ CONTACT: { RECAPTCHA_VERSION: 2 } }),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({
      ok: false,
      msg: 'Cochez la case « Je ne suis pas un robot ».',
    });
  });

  it('envoyerViaFormspree demande un nouvel essai v3 si le jeton est vide', async () => {
    obtenirTokenRecaptcha.mockResolvedValue(null);

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree({ CONTACT: { RECAPTCHA_VERSION: 3 } }),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({
      ok: false,
      msg: 'Vérification anti-spam en cours… réessayez.',
    });
  });

  it('envoyerViaFormspree retourne une erreur Formspree', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ error: 'Refusé' }),
      })
    );

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({
      ok: false,
      msg: 'Erreur serveur',
      reinitialiserRecaptcha: true,
    });
  });

  it('envoyerViaFormspree gère une erreur réseau', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({
      ok: false,
      msg: 'Failed to fetch',
      reinitialiserRecaptcha: true,
    });
  });

  it('envoyerViaFormspree tolère un corps de réponse non JSON', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      })
    );

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      optionsRecaptcha: {},
    });

    expect(result).toEqual({
      ok: false,
      msg: 'Erreur serveur',
      reinitialiserRecaptcha: true,
    });
  });
});
