import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('./score.js', () => ({
  accorderBonusProjet: vi.fn(),
}));

import { accorderBonusProjet } from './score.js';
import { initialiserGrilleProjets } from './projets-grille.js';

describe('projets-grille', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav id="js-projets-sommaire"></nav>
      <div id="js-grille-projets" aria-busy="true"></div>
    `;
  });

  it('génère les cartes et le sommaire depuis la config', () => {
    initialiserGrilleProjets();

    const cartes = document.querySelectorAll('.carte-projet');
    expect(cartes.length).toBe(6);
    expect(document.querySelectorAll('.carte-projet-squelette')).toHaveLength(0);
    expect(document.querySelector('[data-projet="derniereligne"]')).not.toBeNull();
    expect(document.querySelectorAll('.projets-sommaire__liste a')).toHaveLength(6);
    expect(document.getElementById('js-grille-projets')?.getAttribute('aria-busy')).toBeNull();
    expect(document.getElementById('js-grille-projets')?.getAttribute('aria-label')).toBe(
      '6 projets disponibles'
    );
  });

  it('fonctionne sans sommaire latéral', () => {
    document.body.innerHTML = '<div id="js-grille-projets" aria-busy="true"></div>';
    initialiserGrilleProjets();
    expect(document.querySelectorAll('.carte-projet').length).toBe(6);
    expect(document.querySelector('.projets-sommaire__liste')).toBeNull();
  });

  it('ignore l’appel si la grille est absente', () => {
    document.body.innerHTML = '';
    expect(() => initialiserGrilleProjets()).not.toThrow();
  });

  it('affiche un libellé d’aperçu neutre sur les cartes', () => {
    initialiserGrilleProjets();
    const hint = document.querySelector('.carte-projet__clic-hint');
    expect(hint?.textContent).toContain("ouvrir l'aperçu");
  });

  it('accorde un bonus au clic sur le sommaire', () => {
    initialiserGrilleProjets();
    document.querySelector('.projets-sommaire__liste a')?.click();
    expect(accorderBonusProjet).toHaveBeenCalled();
  });

  it('utilise ariaLabel personnalisé et étoiles sur les cartes', () => {
    initialiserGrilleProjets();
    const lsf = document.querySelector('[data-projet="lsf"]');
    expect(lsf?.getAttribute('aria-label')).toBe('Ouvrir le projet LSF');
    expect(document.querySelector('[data-projet="hub"] .carte-projet__diff')?.textContent).toBe(
      '★★☆'
    );
  });

  it('borne les étoiles et la completion invalide', async () => {
    vi.resetModules();
    vi.doMock('../config/projects.js', () => ({
      PROJETS_ORDER: ['edge'],
      PROJETS: {
        edge: {
          num: '99',
          titre: 'Edge',
          descCarte: 'Test',
          tech: ['X'],
          etoiles: 99,
          completion: 'NaN',
        },
      },
      ICONES_PROJETS: {},
    }));
    vi.doMock('./score.js', () => ({ accorderBonusProjet: vi.fn() }));

    document.body.innerHTML = '<div id="js-grille-projets"></div>';
    const { initialiserGrilleProjets: init } = await import('./projets-grille.js');
    init();

    const carte = document.querySelector('[data-projet="edge"]');
    expect(carte?.querySelector('.carte-projet__diff')?.textContent).toBe('★★★');
    expect(carte?.querySelector('.barre-completion__fill')?.style.getPropertyValue('--cible')).toBe(
      '0%'
    );
  });
});
