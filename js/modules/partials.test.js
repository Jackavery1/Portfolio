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

    it('journalise en dev et applique le fallback si HTTP non OK', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
      vi.stubGlobal('location', { hostname: 'localhost', protocol: 'http:', search: '' });
      const erreur = vi.spyOn(console, 'error').mockImplementation(() => {});
      const avert = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await chargerPartiels();

      expect(erreur).toHaveBeenCalled();
      expect(avert).toHaveBeenCalled();
      expect(document.querySelector('.nav--fallback')).not.toBeNull();
      erreur.mockRestore();
      avert.mockRestore();
    });

    it('ignore un conteneur absent', async () => {
      document.body.innerHTML = '';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('<nav></nav>') })
      );

      await expect(chargerPartiels()).resolves.toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('charge un conteneur squelette même s’il contient des placeholders', async () => {
      document.body.innerHTML =
        '<div id="partial-nav" class="partial-squelette" aria-busy="true"><span></span></div>';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: () =>
            Promise.resolve(
              '<nav class="nav"><a class="nav__bouton" href="index.html">HOME</a></nav>'
            ),
        })
      );

      await chargerPartiels();

      expect(fetch).toHaveBeenCalled();
      expect(document.querySelector('.nav__bouton')?.textContent).toBe('HOME');
    });

    it('ne recharge pas un partial déjà embarqué au build', async () => {
      document.body.innerHTML =
        '<div id="partial-nav"><nav class="nav"><a class="nav__bouton" href="projets.html">WORK</a></nav></div>';
      vi.stubGlobal('fetch', vi.fn());

      await chargerPartiels();

      expect(fetch).not.toHaveBeenCalled();
      expect(document.querySelector('.nav__bouton')?.textContent).toBe('WORK');
    });

    it('applique le fallback footer si fetch échoue', async () => {
      document.body.innerHTML = '<div id="partial-footer"></div>';
      vi.resetModules();
      vi.doMock('../config/index.js', () => ({
        CONFIGURATION: {
          PARTIELS: [{ id: 'partial-footer', fichier: 'partials/footer.html' }],
        },
      }));
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

      const { chargerPartiels: charger } = await import('./partials.js');
      await charger();

      expect(document.querySelector('.pied-page--fallback')).not.toBeNull();
    });

    it('marque le lien actif sans partial à charger', async () => {
      document.body.innerHTML = '<nav><a class="nav__bouton" href="projets.html">WORK</a></nav>';
      vi.resetModules();
      vi.doMock('../config/index.js', () => ({
        CONFIGURATION: { PARTIELS: [] },
      }));
      vi.stubGlobal('fetch', vi.fn());

      const { chargerPartiels: charger } = await import('./partials.js');
      await charger();

      expect(fetch).not.toHaveBeenCalled();
      expect(document.querySelector('.nav__bouton.actif')?.getAttribute('href')).toBe(
        'projets.html'
      );
    });

    it('affiche un message générique pour un id de partial inconnu', async () => {
      document.body.innerHTML = '<div id="partial-inconnu"></div>';
      vi.resetModules();
      vi.doMock('../config/index.js', () => ({
        CONFIGURATION: {
          PARTIELS: [{ id: 'partial-inconnu', fichier: 'partials/inconnu.html' }],
        },
      }));
      vi.stubGlobal('location', { hostname: 'example.com', protocol: 'http:', search: '' });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

      const { chargerPartiels: charger } = await import('./partials.js');
      await charger();

      expect(document.body.textContent).toContain('Contenu indisponible (partial-inconnu)');
    });
  });
});
