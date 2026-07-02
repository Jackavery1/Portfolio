/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./recaptcha.js', () => ({
  initRecaptcha: vi.fn(),
}));

import { initRecaptcha } from './recaptcha.js';
import { initialiserRecaptchaContact } from './contact-form-recaptcha.js';

describe('contact-form-recaptcha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="mount"></div>';
  });

  it('initialise reCAPTCHA quand endpoint et clé sont présents', async () => {
    initRecaptcha.mockResolvedValue(true);

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/test',
      recaptchaKey: 'site-key',
      mount: document.getElementById('mount'),
      optionsRecaptcha: {},
    });

    expect(initRecaptcha).toHaveBeenCalled();
  });

  it('affiche une alerte si la clé manque', async () => {
    const mount = document.getElementById('mount');

    await initialiserRecaptchaContact({
      endpoint: 'https://formspree.io/f/test',
      recaptchaKey: '',
      mount,
      optionsRecaptcha: {},
    });

    expect(initRecaptcha).not.toHaveBeenCalled();
    expect(mount.className).toContain('recaptcha-zone--config');
    expect(mount.getAttribute('role')).toBe('alert');
  });
});
