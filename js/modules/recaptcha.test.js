import { beforeEach, describe, expect, it, vi } from 'vitest';
import { retirerScriptsRecaptcha } from './recaptcha-chargement.js';

async function chargerModuleRecaptcha() {
  return import('./recaptcha.js');
}

describe('recaptcha', () => {
  let initialiserRecaptcha;
  let obtenirTokenRecaptcha;
  let reinitialiserWidgetRecaptcha;

  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="js-recaptcha-mount" hidden></div>';
    document.head.innerHTML = '';
    delete window.grecaptcha;
    delete window.__E2E_RECAPTCHA_TOKEN;
    retirerScriptsRecaptcha();
    ({ initialiserRecaptcha, obtenirTokenRecaptcha, reinitialiserWidgetRecaptcha } =
      await chargerModuleRecaptcha());
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

  it('utilise le jeton e2e injecté', async () => {
    window.__E2E_RECAPTCHA_TOKEN = 'e2e-token';

    const token = await obtenirTokenRecaptcha({
      siteKey: 'test-key',
      version: 3,
      action: 'submit',
    });

    expect(token).toBe('e2e-token');
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
    const script = document.querySelector('script[data-recaptcha-v2]');
    script?.onload?.();
    await initPromise;

    reinitialiserWidgetRecaptcha();
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

  it('initialiserRecaptcha v2 retourne false sans conteneur', async () => {
    const ok = await initialiserRecaptcha({ siteKey: 'v2-key', version: 2, mountId: 'absent' });
    expect(ok).toBe(false);
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
    document.querySelector('script[data-recaptcha-v2]')?.onload?.();
    await initPromise;

    const token = await obtenirTokenRecaptcha({ siteKey: 'v2-key', version: 2 });
    expect(token).toBe('token-v2');
    expect(getResponse).toHaveBeenCalledWith(7);
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
    document.querySelector('script[data-recaptcha-v2]')?.onload?.();
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
    document.querySelector('script[data-recaptcha-v2]')?.onload?.();
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

  it('chargerScriptV3 rejette si le script est bloqué', async () => {
    const promesse = initialiserRecaptcha({
      siteKey: 'blocked-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
    });
    await Promise.resolve();
    const script = document.querySelector('script[data-recaptcha-v3]');
    script?.onerror?.();

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
    const scriptB = document.querySelector('script[data-recaptcha-v3]');
    scriptB?.onload?.();
    await promesseB;

    const scripts = document.querySelectorAll('script[data-recaptcha-v3]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toContain('key-b');
  });
});
