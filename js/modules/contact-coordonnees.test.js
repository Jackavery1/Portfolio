/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    CONTACT: {
      EMAIL_B64: btoa('test@example.com'),
    },
    SELECTORS: {
      MENTIONS_EMAIL_LINK: 'js-mentions-email',
    },
  },
}));

import { initContactCoordonnees } from './contact-coordonnees.js';

describe('contact-coordonnees', () => {
  it('hydrate le lien email des mentions légales', () => {
    document.body.innerHTML =
      '<a id="js-mentions-email" href="#" hidden>Chargement…</a>';

    initContactCoordonnees();

    const lien = document.getElementById('js-mentions-email');
    expect(lien.getAttribute('href')).toBe('mailto:test@example.com');
    expect(lien.textContent).toBe('test@example.com');
    expect(lien.hasAttribute('hidden')).toBe(false);
  });
});
