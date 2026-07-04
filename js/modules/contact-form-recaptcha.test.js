/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./recaptcha.js', () => ({
  initialiserRecaptcha: vi.fn(),
}));

import { initialiserRecaptcha } from './recaptcha.js';
import { initialiserRecaptchaContact } from './contact-form-recaptcha.js';

describe('contact-form-recaptcha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="mount"></div>';
  });

  it('initialise reCAPTCHA quand endpoint et clé sont présents', async () => {
    initialiserRecaptcha.mockResolvedValue(true);

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/test',
      recaptchaKey: 'site-key',
      mount: document.getElementById('mount'),
      optionsRecaptcha: {},
    });

    expect(initialiserRecaptcha).toHaveBeenCalled();
  });

  it('affiche une alerte si initialiserRecaptcha échoue', async () => {
    initialiserRecaptcha.mockRejectedValue(new Error('network'));
    const mount = document.getElementById('mount');

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/test',
      recaptchaKey: 'site-key',
      mount,
      optionsRecaptcha: {},
    });

    expect(mount.className).toContain('recaptcha-zone--erreur');
    expect(mount.textContent).toMatch(/indisponible/i);
  });

  it('affiche une alerte si la clé manque', async () => {
    const mount = document.getElementById('mount');

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/test',
      recaptchaKey: '',
      mount,
      optionsRecaptcha: {},
    });

    expect(initialiserRecaptcha).not.toHaveBeenCalled();
    expect(mount.className).toContain('recaptcha-zone--config');
    expect(mount.getAttribute('role')).toBe('alert');
  });
});
