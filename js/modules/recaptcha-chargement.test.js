/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  chargerScriptV2,
  chargerScriptV3,
  retirerScriptsRecaptcha,
} from './recaptcha-chargement.js';

describe('recaptcha-chargement', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    delete window.grecaptcha;
    delete window.__E2E_RECAPTCHA_TOKEN;
    retirerScriptsRecaptcha();
  });

  it('retire les scripts v2 et v3 du head', () => {
    document.head.innerHTML = `
      <script data-recaptcha-v3="1"></script>
      <script data-recaptcha-v2="1"></script>
    `;

    retirerScriptsRecaptcha();

    expect(
      document.querySelectorAll('script[data-recaptcha-v3], script[data-recaptcha-v2]')
    ).toHaveLength(0);
  });

  it('rejette si grecaptcha absent après onload v3', async () => {
    const promesse = chargerScriptV3('cle-v3');
    await Promise.resolve();
    document.querySelector('script[data-recaptcha-v3]')?.onload?.();

    await expect(promesse).rejects.toThrow(/indisponible après chargement/);
  });

  it('rejette si le script v2 est bloqué', async () => {
    const promesse = chargerScriptV2('cle-v2');
    await Promise.resolve();
    document.querySelector('script[data-recaptcha-v2]')?.onerror?.();

    await expect(promesse).rejects.toThrow(/impossible/i);
  });

  it('réutilise la promesse en cours pendant le chargement v3', async () => {
    const promesseA = chargerScriptV3('cle-nouvelle');
    await Promise.resolve();
    const promesseB = chargerScriptV3('cle-nouvelle');

    expect(promesseB).toBe(promesseA);

    window.grecaptcha = {
      ready: (cb) => cb(),
    };
    document.querySelector('script[data-recaptcha-v3]')?.onload?.();
    await promesseA;
  });

  it('court-circuite en mode e2e avec grecaptcha présent', async () => {
    window.__E2E_RECAPTCHA_TOKEN = 'e2e';
    window.grecaptcha = {
      ready: (cb) => cb(),
    };

    const g = await chargerScriptV3('cle-e2e');

    expect(g).toBe(window.grecaptcha);
    expect(document.querySelector('script[data-recaptcha-v3]')).toBeNull();
  });
});
