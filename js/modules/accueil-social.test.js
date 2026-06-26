/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SOCIAL: { LINKEDIN: 'https://linkedin.com/in/test' },
  },
}));

import { initAccueilSocial } from './accueil-social.js';

describe('accueil-social', () => {
  beforeEach(() => {
    document.body.innerHTML = '<a id="js-lien-linkedin" hidden href="#">LinkedIn</a>';
  });

  it('hydrate le lien LinkedIn quand configuré', () => {
    initAccueilSocial();

    const lien = document.getElementById('js-lien-linkedin');
    expect(lien.getAttribute('href')).toBe('https://linkedin.com/in/test');
    expect(lien.hidden).toBe(false);
  });
});
