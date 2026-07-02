/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initRecaptcha, obtenirTokenRecaptcha, resetRecaptcha } from './recaptcha.js';

describe('recaptcha', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="js-recaptcha-mount" hidden></div>';
    document.head.innerHTML = '';
    delete window.grecaptcha;
    delete window.__E2E_RECAPTCHA_TOKEN;
  });

  it('affiche le bandeau v3 quand le script est déjà chargé', async () => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=test-key';
    script.dataset.recaptchaV3 = '1';
    document.head.appendChild(script);

    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockResolvedValue('jeton-v3'),
    };

    const ok = await initRecaptcha({
      siteKey: 'test-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });

    expect(ok).toBe(true);
    const mount = document.getElementById('js-recaptcha-mount');
    expect(mount.hidden).toBe(false);
    expect(mount.textContent).toContain('reCAPTCHA v3');
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

  it('resetRecaptcha ne plante pas sans widget', () => {
    expect(() => resetRecaptcha()).not.toThrow();
  });

  it('initRecaptcha retourne false sans clé site', async () => {
    const ok = await initRecaptcha({ siteKey: '', version: 3, mountId: 'js-recaptcha-mount' });
    expect(ok).toBe(false);
  });

  it('initRecaptcha court-circuite en mode e2e', async () => {
    window.__E2E_RECAPTCHA_TOKEN = 'e2e';
    const ok = await initRecaptcha({
      siteKey: 'test-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });
    expect(ok).toBe(true);
  });

  it('resetRecaptcha appelle grecaptcha.reset avec widgetId', async () => {
    const reset = vi.fn();
    window.grecaptcha = {
      ready: (cb) => cb(),
      render: vi.fn().mockReturnValue(42),
      reset,
    };

    const initPromise = initRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    const script = document.querySelector('script[data-recaptcha-v2]');
    script?.onload?.();
    await initPromise;

    resetRecaptcha();
    expect(reset).toHaveBeenCalledWith(42);
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

  it('initRecaptcha v2 retourne false sans conteneur', async () => {
    const ok = await initRecaptcha({ siteKey: 'v2-key', version: 2, mountId: 'absent' });
    expect(ok).toBe(false);
  });

  it('obtenirTokenRecaptcha sans clé retourne null', async () => {
    expect(await obtenirTokenRecaptcha({ siteKey: '', version: 3 })).toBeNull();
  });
});
