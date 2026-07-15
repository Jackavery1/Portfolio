import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  chargerModuleRecaptcha,
  declencherErreurScriptV3,
  declencherOnloadScriptV2,
  declencherOnloadScriptV3,
  preparerDomRecaptcha,
} from '../test-fixtures/recaptcha-test-setup.js';

describe('recaptcha — initialisation', () => {
  let initialiserRecaptcha;
  let reinitialiserWidgetRecaptcha;

  beforeEach(async () => {
    vi.resetModules();
    preparerDomRecaptcha();
    ({ initialiserRecaptcha, reinitialiserWidgetRecaptcha } = await chargerModuleRecaptcha());
  });

  it('charge v3 sans afficher de bandeau', async () => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=test-key';
    script.dataset.recaptchaV3 = '1';
    document.head.appendChild(script);

    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockResolvedValue('jeton-v3'),
    };

    const ok = await initialiserRecaptcha({
      siteKey: 'test-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });

    expect(ok).toBe(true);
    const mount = document.getElementById('js-recaptcha-mount');
    expect(mount.textContent).toBe('');
    expect(mount.hidden).toBe(true);
  });

  it('reinitialiserWidgetRecaptcha ne plante pas sans widget', () => {
    expect(() => reinitialiserWidgetRecaptcha()).not.toThrow();
  });

  it('initialiserRecaptcha retourne false sans clé site', async () => {
    const ok = await initialiserRecaptcha({
      siteKey: '',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });
    expect(ok).toBe(false);
  });

  it('initialiserRecaptcha court-circuite en mode e2e', async () => {
    window.__E2E_RECAPTCHA_TOKEN = 'e2e';
    const ok = await initialiserRecaptcha({
      siteKey: 'test-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });
    expect(ok).toBe(true);
  });

  it('reinitialiserWidgetRecaptcha appelle grecaptcha.reset avec idWidget', async () => {
    const reset = vi.fn();
    window.grecaptcha = {
      ready: (cb) => cb(),
      render: vi.fn().mockReturnValue(42),
      reset,
    };

    const initPromise = initialiserRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    declencherOnloadScriptV2();
    await initPromise;

    reinitialiserWidgetRecaptcha();
    expect(reset).toHaveBeenCalledWith(42);
  });

  it('initialiserRecaptcha v2 retourne false sans conteneur', async () => {
    const ok = await initialiserRecaptcha({ siteKey: 'v2-key', version: 2, mountId: 'absent' });
    expect(ok).toBe(false);
  });

  it('initialiserRecaptcha v2 re-render si le mount a été vidé', async () => {
    const render = vi.fn().mockReturnValueOnce(3).mockReturnValueOnce(9);
    window.grecaptcha = {
      ready: (cb) => cb(),
      render,
      reset: vi.fn(),
    };

    const initPromise = initialiserRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    declencherOnloadScriptV2();
    await initPromise;

    document.getElementById('js-recaptcha-mount').innerHTML = '';

    const reinitPromise = initialiserRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    await reinitPromise;

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(document.getElementById('js-recaptcha-mount'), {
      sitekey: 'v2-key',
    });
  });

  it('initialiserRecaptcha v2 réinitialise le widget si le mount est déjà peuplé', async () => {
    const reset = vi.fn();
    const render = vi.fn((mount) => {
      mount.appendChild(document.createElement('div'));
      return 42;
    });
    window.grecaptcha = {
      ready: (cb) => cb(),
      render,
      reset,
    };

    const initPromise = initialiserRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    declencherOnloadScriptV2();
    await initPromise;

    const reinitPromise = initialiserRecaptcha({
      siteKey: 'v2-key',
      version: 2,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    await reinitPromise;

    expect(reset).toHaveBeenCalledWith(42);
    expect(render).toHaveBeenCalledTimes(1);
  });

  it('chargerScriptV3 rejette si le script est bloqué', async () => {
    const promesse = initialiserRecaptcha({
      siteKey: 'blocked-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    declencherErreurScriptV3();

    await expect(promesse).rejects.toThrow(/bloqué/);
  });

  it('recharge le script v3 si la clé site change', async () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockResolvedValue('a'),
    };

    const scriptA = document.createElement('script');
    scriptA.src = 'https://www.google.com/recaptcha/api.js?render=key-a';
    scriptA.dataset.recaptchaV3 = '1';
    document.head.appendChild(scriptA);

    await initialiserRecaptcha({ siteKey: 'key-a', version: 3, mountId: 'js-recaptcha-mount' });

    const promesseB = initialiserRecaptcha({
      siteKey: 'key-b',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    declencherOnloadScriptV3();
    await promesseB;

    const scripts = document.querySelectorAll('script[data-recaptcha-v3]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toContain('key-b');
  });
});
