/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SELECTORS: {
      MODAL: 'js-modal',
      MODAL_TITRE: 'js-modal-titre',
      MODAL_IMG: 'js-modal-img',
      MODAL_DESC: 'js-modal-desc',
      MODAL_TECH: 'js-modal-tech',
      MODAL_FERMER: 'js-modal-fermer',
      MODAL_LIEN: 'js-modal-lien',
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
    SCORE_BONUS: { PROJET: 600 },
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
