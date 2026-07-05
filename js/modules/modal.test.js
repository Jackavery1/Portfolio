/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: {
      MODALE: 'js-modal',
      MODALE_TITRE: 'js-modal-titre',
      MODALE_IMG: 'js-modal-img',
      MODALE_DESC: 'js-modal-desc',
      MODALE_TECH: 'js-modal-tech',
      MODALE_FERMER: 'js-modal-fermer',
      MODALE_LIEN: 'js-modal-lien',
    },
    PROJETS: {
      test: {
        titre: 'Projet test',
        desc: 'Description',
        tech: ['HTML'],
        apercu: 'assets/previews/test.png',
        lien: 'https://github.com/example',
      },
    },
    BONUS_SCORE: { PROJET: 600 },
  },
}));

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

import { fermerModal, ouvrirModal } from './modal.js';

describe('modal', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ecran"></div>
      <button type="button" id="focus-avant">Avant</button>
      <div id="js-modal" hidden role="dialog">
        <h2 id="js-modal-titre"></h2>
        <img id="js-modal-img" alt="" />
        <p id="js-modal-desc"></p>
        <p id="js-modal-lien" class="modal-lien" hidden></p>
        <div id="js-modal-tech"></div>
        <button type="button" id="js-modal-fermer">Fermer</button>
      </div>
    `;
    document.getElementById('focus-avant').focus();
  });

  it('ouvre et ferme la modale projet', () => {
    ouvrirModal('test');

    const modal = document.getElementById('js-modal');
    expect(modal.hidden).toBe(false);
    expect(document.querySelector('.ecran').hasAttribute('inert')).toBe(true);
    expect(modal.hasAttribute('inert')).toBe(false);
    expect(document.getElementById('js-modal-titre').textContent).toBe('Projet test');
    expect(document.getElementById('js-modal-lien').querySelector('a')?.href).toContain(
      'github.com'
    );

    fermerModal();
    expect(modal.hidden).toBe(true);
    expect(document.querySelector('.ecran').hasAttribute('inert')).toBe(false);
  });
});
