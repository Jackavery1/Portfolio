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
});
