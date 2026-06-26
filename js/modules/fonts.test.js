/* @vitest-environment jsdom */
import { describe, expect, it, beforeEach } from 'vitest';
import { initPolicesAsync } from './fonts.js';

describe('fonts', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('injecte la feuille Google Fonts de façon asynchrone', () => {
    initPolicesAsync();

    const lien = document.querySelector('link[data-portfolio-fonts]');
    expect(lien).not.toBeNull();
    expect(lien?.getAttribute('rel')).toBe('stylesheet');
    expect(lien?.getAttribute('href')).toContain('fonts.googleapis.com');
  });

  it('n’ajoute pas de doublon', () => {
    initPolicesAsync();
    initPolicesAsync();

    expect(document.querySelectorAll('link[data-portfolio-fonts]')).toHaveLength(1);
  });
});
