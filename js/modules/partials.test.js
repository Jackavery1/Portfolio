/* @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  FALLBACKS_PARTIELS,
  appliquerFallbackPartial,
  chargerPartials,
  marquerLienActif,
} from './partials.js';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    PARTIALS: [{ id: 'partial-nav', fichier: 'partials/nav.html' }],
  },
}));

vi.mock('../utils/dom.js', () => ({
  byId: (id) => document.getElementById(id),
}));

vi.mock('../utils/page.js', () => ({
  getCurrentPageFile: () => 'projets.html',
}));

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

  describe('chargerPartials', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="partial-nav"></div>';
    });

    it('injecte le HTML du partial en cas de succès fetch', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('<nav class="nav">OK</nav>'),
        })
      );

      await chargerPartials();

      expect(document.querySelector('.nav')?.textContent).toBe('OK');
    });

    it('applique le fallback si fetch échoue', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

      await chargerPartials();

      expect(document.querySelector('.nav--fallback')).not.toBeNull();
    });

    it('applique le fallback sans fetch en protocole file:', async () => {
      vi.stubGlobal('fetch', vi.fn());
      vi.stubGlobal('location', { ...window.location, protocol: 'file:' });

      await chargerPartials();

      expect(fetch).not.toHaveBeenCalled();
      expect(document.querySelector('.nav--fallback')).not.toBeNull();
    });
  });

  it('marque le lien actif selon la page courante', () => {
    document.body.innerHTML = `
      <a class="nav__bouton" href="index.html">HOME</a>
      <a class="nav__bouton" href="projets.html">WORK</a>
    `;

    marquerLienActif();

    const actif = document.querySelector('.nav__bouton.actif');
    expect(actif?.getAttribute('href')).toBe('projets.html');
    expect(actif?.getAttribute('aria-current')).toBe('page');
  });
});
