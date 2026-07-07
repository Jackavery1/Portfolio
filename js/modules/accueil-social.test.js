/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const configMock = vi.hoisted(() => ({
  CONFIGURATION: {
    SOCIAL: { LINKEDIN: 'https://linkedin.com/in/test' },
  },
}));

vi.mock('../config/index.js', () => configMock);

import { initialiserAccueilSocial } from './accueil-social.js';

describe('accueil-social', () => {
  beforeEach(() => {
    configMock.CONFIGURATION.SOCIAL.LINKEDIN = 'https://linkedin.com/in/test';
    document.body.innerHTML = '<a id="js-lien-linkedin" hidden href="#">LinkedIn</a>';
  });

  it('hydrate le lien LinkedIn quand configuré', () => {
    initialiserAccueilSocial();

    const lien = document.getElementById('js-lien-linkedin');
    expect(lien.getAttribute('href')).toBe('https://linkedin.com/in/test');
    expect(lien.hidden).toBe(false);
  });

  it('ne modifie rien si LinkedIn est absent', () => {
    configMock.CONFIGURATION.SOCIAL.LINKEDIN = '';
    initialiserAccueilSocial();
    const lien = document.getElementById('js-lien-linkedin');
    expect(lien.hidden).toBe(true);
    expect(lien.getAttribute('href')).toBe('#');
  });
});
