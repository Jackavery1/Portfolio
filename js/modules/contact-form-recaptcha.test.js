import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    CONTACT: {
      RECAPTCHA_SITE_KEY: 'site-key',
      RECAPTCHA_VERSION: 3,
    },
    SELECTEURS: { MONTE_RECAPTCHA: 'js-recaptcha-mount' },
  },
}));

vi.mock('./recaptcha.js', () => ({
  initialiserRecaptcha: vi.fn(),
}));

import { initialiserRecaptcha } from './recaptcha.js';
import {
  initialiserRecaptchaContact,
  optionsRecaptchaContact,
  planifierRecaptchaAuFocus,
} from './contact-form-recaptcha.js';

describe('contact-form-recaptcha', () => {
  beforeEach(() => {
    vi.mocked(initialiserRecaptcha).mockReset();
    document.body.innerHTML = `
      <form id="f"><input /></form>
      <div id="js-recaptcha-mount" hidden></div>
    `;
  });

  it('expose les options reCAPTCHA v3', () => {
    expect(optionsRecaptchaContact()).toEqual({
      siteKey: 'site-key',
      version: 3,
      mountId: 'js-recaptcha-mount',
      action: 'submit',
    });
  });

  it('affiche une erreur si reCAPTCHA échoue au chargement', async () => {
    vi.mocked(initialiserRecaptcha).mockRejectedValueOnce(new Error('fail'));
    const mount = document.getElementById('js-recaptcha-mount');

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/xxx',
      recaptchaKey: 'site-key',
      mount,
      optionsRecaptcha: optionsRecaptchaContact(),
    });

    expect(mount.hidden).toBe(false);
    expect(mount.className).toContain('recaptcha-zone--erreur');
  });

  it('affiche un message si la clé reCAPTCHA manque', async () => {
    const mount = document.getElementById('js-recaptcha-mount');

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/xxx',
      recaptchaKey: '',
      mount,
      optionsRecaptcha: optionsRecaptchaContact(),
    });

    expect(mount.hidden).toBe(false);
    expect(mount.className).toContain('recaptcha-zone--config');
    expect(mount.getAttribute('role')).toBe('alert');
  });

  it('planifie le chargement reCAPTCHA au focus', async () => {
    vi.mocked(initialiserRecaptcha).mockResolvedValueOnce(undefined);
    const formulaire = document.getElementById('f');
    const mount = document.getElementById('js-recaptcha-mount');
    const lancer = planifierRecaptchaAuFocus(formulaire, {
      endpoint: 'https://formspree.io/f/xxx',
      recaptchaKey: 'site-key',
      mount,
      optionsRecaptcha: optionsRecaptchaContact(),
    });

    formulaire.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await lancer();

    expect(initialiserRecaptcha).toHaveBeenCalled();
  });

  it('initialise sans clé si endpoint seul est défini', async () => {
    const mount = document.getElementById('js-recaptcha-mount');
    const formulaire = document.getElementById('f');

    planifierRecaptchaAuFocus(formulaire, {
      endpoint: 'https://formspree.io/f/xxx',
      recaptchaKey: '',
      mount,
      optionsRecaptcha: optionsRecaptchaContact(),
    });

    expect(mount.className).toContain('recaptcha-zone--config');
  });
});
