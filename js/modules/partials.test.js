/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { FALLBACKS_PARTIELS, appliquerFallbackPartial } from './partials.js';

describe('partials', () => {
  it('expose un fallback nav avec role alert', () => {
    expect(FALLBACKS_PARTIELS['partial-nav']).toContain('role="alert"');
    expect(FALLBACKS_PARTIELS['partial-nav']).toContain('role="navigation"');
  });

  it('remplace le conteneur nav par le fallback', () => {
    document.body.innerHTML = '<div id="partial-nav"></div>';
    const el = document.getElementById('partial-nav');
    appliquerFallbackPartial(el, 'partial-nav');
    expect(document.querySelector('.nav--fallback')).not.toBeNull();
    expect(document.querySelector('.nav__fallback')).not.toBeNull();
  });

  it('affiche un message générique pour un id inconnu', () => {
    document.body.innerHTML = '<div id="partial-crt"></div>';
    const el = document.getElementById('partial-crt');
    appliquerFallbackPartial(el, 'partial-crt');
    expect(el.textContent).toContain('partial-crt');
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
  });
});
