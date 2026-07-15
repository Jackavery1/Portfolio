import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  chargerModuleRecaptcha,
  declencherOnloadScriptV2,
  preparerDomRecaptcha,
} from '../test-fixtures/recaptcha-test-setup.js';

describe('recaptcha — jeton', () => {
  let initialiserRecaptcha;
  let obtenirTokenRecaptcha;

  beforeEach(async () => {
    vi.resetModules();
    preparerDomRecaptcha();
    ({ initialiserRecaptcha, obtenirTokenRecaptcha } = await chargerModuleRecaptcha());
  });

  it('utilise le jeton e2e injecté', async () => {
    window.__E2E_RECAPTCHA_TOKEN = 'e2e-token';

    const token = await obtenirTokenRecaptcha({
      siteKey: 'test-key',
      version: 3,
      action: 'submit',
    });

    expect(token).toBe('e2e-token');
  });

  it('obtenirTokenRecaptcha v3 propage erreur clé invalide', async () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockRejectedValue(new Error('invalid site key')),
    };
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=bad-key';
    script.dataset.recaptchaV3 = '1';
    document.head.appendChild(script);

    await expect(obtenirTokenRecaptcha({ siteKey: 'bad-key', version: 3 })).rejects.toThrow(
      /PORTFOLIO_RECAPTCHA_SITE_KEY/
    );
  });

  it('obtenirTokenRecaptcha v2 retourne la réponse du widget', async () => {
    const getResponse = vi.fn().mockReturnValue('token-v2');
    window.grecaptcha = {
      ready: (cb) => cb(),
      render: vi.fn().mockReturnValue(7),
      getResponse,
    };

    const initPromise = initialiserRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    declencherOnloadScriptV2();
    await initPromise;

    const token = await obtenirTokenRecaptcha({ siteKey: 'v2-key', version: 2 });
    expect(token).toBe('token-v2');
    expect(getResponse).toHaveBeenCalledWith(7);
  });

  it('obtenirTokenRecaptcha v3 exécute grecaptcha avec la clé', async () => {
    const execute = vi.fn().mockResolvedValue('jeton-execute');
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute,
    };
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=site-v3';
    script.dataset.recaptchaV3 = '1';
    document.head.appendChild(script);

    const token = await obtenirTokenRecaptcha({
      siteKey: 'site-v3',
      version: 3,
      action: 'contact',
    });

    expect(token).toBe('jeton-execute');
    expect(execute).toHaveBeenCalledWith('site-v3', { action: 'contact' });
  });

  it('obtenirTokenRecaptcha v3 propage une erreur générique', async () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockRejectedValue(new Error('timeout réseau')),
    };
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=key';
    script.dataset.recaptchaV3 = '1';
    document.head.appendChild(script);

    await expect(obtenirTokenRecaptcha({ siteKey: 'key', version: 3 })).rejects.toThrow(
      'Jeton reCAPTCHA : timeout réseau'
    );
  });

  it('obtenirTokenRecaptcha v3 sans détail d’erreur', async () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockRejectedValue(new Error('')),
    };
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=key';
    script.dataset.recaptchaV3 = '1';
    document.head.appendChild(script);

    await expect(obtenirTokenRecaptcha({ siteKey: 'key', version: 3 })).rejects.toThrow(
      'Impossible de générer le jeton reCAPTCHA'
    );
  });
});
