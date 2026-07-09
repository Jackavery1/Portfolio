/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appliquerEtatBoutonMusique, lirePreferenceMusique } from './musique-bouton.js';

describe('musique-bouton', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <button id="btn">
        <span class="nav__musique-libelle"></span>
      </button>
    `;
  });

  it('lit la préférence localStorage', () => {
    localStorage.setItem('cle-musique', 'true');
    expect(lirePreferenceMusique('cle-musique')).toBe(true);
    expect(lirePreferenceMusique('autre')).toBe(false);
  });

  it('retourne false si localStorage est indisponible', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqué');
    });
    expect(lirePreferenceMusique('cle-musique')).toBe(false);
    getItem.mockRestore();
  });

  it('applique les états off, pret et on', () => {
    const bouton = document.getElementById('btn');

    appliquerEtatBoutonMusique(bouton, 'off');
    expect(bouton.dataset.etat).toBe('off');
    expect(bouton.getAttribute('aria-label')).toBe('Activer la musique');

    appliquerEtatBoutonMusique(bouton, 'pret');
    expect(bouton.dataset.etat).toBe('pret');
    expect(bouton.querySelector('.nav__musique-libelle').textContent).toBe('PRÊT');

    appliquerEtatBoutonMusique(bouton, 'on');
    expect(bouton.dataset.etat).toBe('on');
    expect(bouton.getAttribute('aria-pressed')).toBe('true');
    expect(bouton.getAttribute('title')).toBeNull();
  });

  it('ignore un bouton absent', () => {
    expect(() => appliquerEtatBoutonMusique(null, 'off')).not.toThrow();
  });
});
