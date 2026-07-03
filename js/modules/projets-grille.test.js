/* @vitest-environment jsdom */
import { describe, expect, it, beforeEach } from 'vitest';
import { initProjetsGrille } from './projets-grille.js';

describe('projets-grille', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <nav id="js-projets-sommaire"></nav>
      <div id="js-grille-projets" aria-busy="true"></div>
    `;
  });

  it('génère les cartes et le sommaire depuis la config', () => {
    initProjetsGrille();

    const cartes = document.querySelectorAll('.carte-projet');
    expect(cartes.length).toBe(6);
    expect(document.querySelector('[data-projet="derniereligne"]')).not.toBeNull();
    expect(document.querySelectorAll('.projets-sommaire__liste a')).toHaveLength(6);
    expect(document.getElementById('js-grille-projets')?.getAttribute('aria-busy')).toBeNull();
    expect(document.getElementById('js-grille-projets')?.getAttribute('aria-label')).toBeNull();
  });
});
