/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const configMock = vi.hoisted(() => ({
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
      raster: {
        titre: 'Raster',
        desc: 'Image PNG',
        tech: ['CSS'],
        apercu: 'assets/previews/photo.png',
        lien: 'https://github.com/example/raster',
      },
      svg: {
        titre: 'SVG',
        desc: 'Vectoriel',
        tech: ['SVG'],
        apercu: 'assets/previews/demo.svg',
      },
      sansApercu: {
        titre: 'Sans aperçu',
        desc: 'Pas d’image',
        tech: ['HTML'],
        lien: 'https://github.com/example/sans',
      },
      sansLiens: {
        titre: 'Sans liens',
        desc: 'Pas de liens',
        tech: ['HTML'],
        apercu: 'assets/previews/nolink.png',
      },
    },
    BONUS_SCORE: { PROJET: 600 },
  },
}));

vi.mock('../config/index.js', () => configMock);

vi.mock('./audio.js', () => ({
  jouerBip: vi.fn(),
}));

vi.mock('./score.js', () => ({
  ajouterScore: vi.fn(),
}));

import {
  fermerModal,
  initialiserClicsModale,
  initialiserClavierModale,
  ouvrirModal,
} from './modal.js';

function monterModal({ avecLien = true } = {}) {
  document.body.innerHTML = `
    <div class="ecran"></div>
    <button type="button" id="focus-avant">Avant</button>
    <div id="js-modal" hidden role="dialog">
      <h2 id="js-modal-titre"></h2>
      <img id="js-modal-img" alt="" />
      <p id="js-modal-desc"></p>
      ${avecLien ? '<p id="js-modal-lien" class="modal-lien" hidden></p>' : ''}
      <div id="js-modal-tech"></div>
      <button type="button" id="js-modal-fermer">Fermer</button>
    </div>
    <button type="button" class="carte-projet" data-projet="test">Carte</button>
  `;
  document.getElementById('focus-avant').focus();
}

describe('modal', () => {
  beforeEach(() => {
    monterModal();
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

  it('ignore ouvrirModal si le projet ou le DOM est incomplet', () => {
    ouvrirModal('inconnu');
    expect(document.getElementById('js-modal').hidden).toBe(true);

    document.getElementById('js-modal-titre').remove();
    ouvrirModal('test');
    expect(document.getElementById('js-modal').hidden).toBe(true);
  });

  it('crée le conteneur de liens si absent', () => {
    monterModal({ avecLien: false });
    ouvrirModal('test');
    expect(document.getElementById('js-modal-lien')).not.toBeNull();
  });

  it('masque l’image et les liens quand le projet n’en a pas', () => {
    ouvrirModal('sansApercu');
    expect(document.getElementById('js-modal-img').hidden).toBe(true);

    ouvrirModal('sansLiens');
    expect(document.getElementById('js-modal-lien').hidden).toBe(true);
  });

  it('ajoute une balise picture pour les aperçus raster', () => {
    ouvrirModal('raster');
    const img = document.getElementById('js-modal-img');
    expect(img.closest('picture')).not.toBeNull();
    expect(img.closest('picture').querySelector('source[type="image/webp"]')).not.toBeNull();
  });

  it('marque les SVG sans picture', () => {
    ouvrirModal('svg');
    const img = document.getElementById('js-modal-img');
    expect(img.classList.contains('modal-img--svg')).toBe(true);
    expect(img.closest('picture')).toBeNull();
  });

  it('initialiserClavierModale ferme avec Escape', () => {
    initialiserClavierModale();
    ouvrirModal('test');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.getElementById('js-modal').hidden).toBe(true);
  });

  it('initialiserClicsModale ouvre et ferme via carte, bouton et overlay', () => {
    initialiserClicsModale();
    document.querySelector('.carte-projet').click();
    expect(document.getElementById('js-modal').hidden).toBe(false);

    document.getElementById('js-modal-fermer').click();
    expect(document.getElementById('js-modal').hidden).toBe(true);

    document.querySelector('.carte-projet').click();
    document.getElementById('js-modal').click();
    expect(document.getElementById('js-modal').hidden).toBe(true);
  });

  it('fermerModal sans overlay est sans effet', () => {
    ouvrirModal('test');
    document.getElementById('js-modal').remove();
    expect(() => fermerModal()).not.toThrow();
  });
});
