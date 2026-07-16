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

vi.mock('./recaptcha.js', () => ({
  obtenirTokenRecaptcha: vi.fn(),
  reinitialiserWidgetRecaptcha: vi.fn(),
}));

import { jouerBip } from './audio.js';
import { reinitialiserWidgetRecaptcha, obtenirTokenRecaptcha } from './recaptcha.js';
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

    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    const result = await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
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
      configuration: configurationFormspree(),
      champs: champsContactDemo,
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
      configuration: configurationFormspree(),
      champs: champsContactDemo,
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

  it('envoyerViaFormspree refuse l’envoi sans clé reCAPTCHA', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const btn = document.getElementById('btn');
    const mount = document.createElement('div');
    mount.scrollIntoView = vi.fn();
    const afficherErreur = vi.fn();

    await envoyerViaFormspree({
      configuration: configurationFormspree({ CONTACT: { RECAPTCHA_SITE_KEY: '' } }),
      champs: champsContactDemo,
      sujetUtile: '',
      btnEnvoyer: btn,
      mount,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(jouerBip).toHaveBeenCalled();
    expect(mount.scrollIntoView).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('envoyerViaFormspree demande la case v2 si le jeton est vide', async () => {
    obtenirTokenRecaptcha.mockResolvedValue(null);
    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    await envoyerViaFormspree({
      configuration: configurationFormspree({ CONTACT: { RECAPTCHA_VERSION: 2 } }),
      champs: champsContactDemo,
      sujetUtile: '',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(afficherErreur).toHaveBeenCalledWith('Cochez la case « Je ne suis pas un robot ».');
    expect(reinitialiserWidgetRecaptcha).not.toHaveBeenCalled();
  });

  it('envoyerViaFormspree affiche une erreur Formspree', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ error: 'Refusé' }),
      })
    );

    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(afficherErreur).toHaveBeenCalledWith('Erreur serveur');
    expect(reinitialiserWidgetRecaptcha).toHaveBeenCalled();
  });

  it('envoyerViaFormspree gère une erreur réseau', async () => {
    obtenirTokenRecaptcha.mockResolvedValue('token');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')));

    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(afficherErreur).toHaveBeenCalled();
    expect(reinitialiserWidgetRecaptcha).toHaveBeenCalled();
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

    const btn = document.getElementById('btn');
    const afficherErreur = vi.fn();

    await envoyerViaFormspree({
      configuration: configurationFormspree(),
      champs: champsContactDemo,
      sujetUtile: '',
      btnEnvoyer: btn,
      mount: null,
      optionsRecaptcha: {},
      afficherErreur,
    });

    expect(afficherErreur).toHaveBeenCalledWith('Erreur serveur');
    expect(btn.disabled).toBe(false);
    expect(reinitialiserWidgetRecaptcha).toHaveBeenCalled();
  });
});
