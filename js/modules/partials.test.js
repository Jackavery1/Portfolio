/* @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { chargerPartiels } from './partials.js';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    PARTIELS: [{ id: 'partial-nav', fichier: 'partials/nav.html' }],
  },
}));

vi.mock('../utils/dom.js', () => ({
  parId: (id) => document.getElementById(id),
}));

vi.mock('../utils/page.js', () => ({
  obtenirFichierPageCourante: () => 'projets.html',
}));

describe('partials', () => {
  describe('chargerPartiels', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="partial-nav"></div>';
    });

    it('injecte le HTML du partial en cas de succès fetch', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: () =>
            Promise.resolve(
              '<nav class="nav"><a class="nav__bouton" href="index.html">HOME</a><a class="nav__bouton" href="projets.html">WORK</a></nav>'
            ),
        })
      );

      await chargerPartiels();

      expect(document.querySelector('.nav')?.textContent).toContain('WORK');
      const actif = document.querySelector('.nav__bouton.actif');
      expect(actif?.getAttribute('href')).toBe('projets.html');
      expect(actif?.getAttribute('aria-current')).toBe('page');
    });

    it('applique le fallback nav si fetch échoue', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

      await chargerPartiels();

      expect(document.querySelector('.nav--fallback')).not.toBeNull();
      expect(document.querySelector('.nav__fallback[role="alert"]')).not.toBeNull();
      expect(document.querySelector('nav[role="navigation"]')).not.toBeNull();
    });

    it('bouton réessayer du fallback recharge la page', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
      const reload = vi.fn();
      vi.stubGlobal('location', { ...window.location, reload });

      await chargerPartiels();

      document.querySelector('.nav__fallback-retry')?.click();
      expect(reload).toHaveBeenCalled();
    });

    it('applique le fallback sans fetch en protocole file:', async () => {
      vi.stubGlobal('fetch', vi.fn());
      vi.stubGlobal('location', { ...window.location, protocol: 'file:' });

      await chargerPartiels();

      expect(fetch).not.toHaveBeenCalled();
      expect(document.querySelector('.nav--fallback')).not.toBeNull();
    });
  });
});
