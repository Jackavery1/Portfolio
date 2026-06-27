/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    CONTACT: {
      EMAIL_B64: btoa('test@example.com'),
      PHONE_PARTS: [6, 74, 52, 24, 96],
    },
    SELECTORS: {
      CONTACT_EMAIL_DISPLAY: 'js-contact-email',
      CONTACT_PHONE_DISPLAY: 'js-contact-phone',
    },
  },
}));

import { initContactCoordonnees } from './contact-coordonnees.js';

describe('contact-coordonnees', () => {
  it('hydrate email et téléphone sur la page contact', () => {
    document.body.innerHTML =
      '<span id="js-contact-email"></span><span id="js-contact-phone"></span>';

    initContactCoordonnees();

    const emailLien = document.querySelector('#js-contact-email a');
    expect(emailLien?.getAttribute('href')).toBe('mailto:test@example.com');

    const phoneLien = document.querySelector('#js-contact-phone a');
    expect(phoneLien?.getAttribute('href')).toMatch(/^tel:\+33/);
  });
});
