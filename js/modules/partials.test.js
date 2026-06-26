/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { FALLBACKS_PARTIELS, appliquerFallbackPartial } from './partials.js';

describe('partials', () => {
  it('expose un fallback nav avec role alert', () => {
    expect(FALLBACKS_PARTIELS['partial-nav']).toContain('role="alert"');
    expect(FALLBACKS_PARTIELS['partial-nav']).toContain('role="navigation"');
  });

  it('remplace le conteneur nav par le fallback avec bouton réessayer', () => {
    document.body.innerHTML = '<div id="partial-nav"></div>';
    const el = document.getElementById('partial-nav');
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });

    appliquerFallbackPartial(el, 'partial-nav');

    expect(document.querySelector('.nav--fallback')).not.toBeNull();
    const retry = document.querySelector('.nav__fallback-retry');
    expect(retry).not.toBeNull();
    retry?.click();
    expect(reload).toHaveBeenCalled();
  });

  it('affiche un message générique pour un id inconnu', () => {
    document.body.innerHTML = '<div id="partial-crt"></div>';
    const el = document.getElementById('partial-crt');
    appliquerFallbackPartial(el, 'partial-crt');
    expect(el.textContent).toContain('partial-crt');
    expect(el.querySelector('[role="alert"]')).not.toBeNull();
  });
});
