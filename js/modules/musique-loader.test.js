import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocksMusique = vi.hoisted(() => ({
  initialiserMusique: vi.fn(),
  basculerMusique: vi.fn().mockResolvedValue(undefined),
  activerMusique: vi.fn().mockResolvedValue(undefined),
  jouerJingleVictoire: vi.fn(),
  jouerJingleSecret: vi.fn(),
}));

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { BOUTON_MUSIQUE: 'js-bouton-musique', MENU: 'js-menu' },
    STOCKAGE: { CLE_MUSIQUE: 'portfolio_musique_active' },
  },
}));

vi.mock('./musique.js', () => mocksMusique);

import { initialiserMusique, jouerJingleSecret, jouerJingleVictoire } from './musique-loader.js';

describe('musique-loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.body.innerHTML = `
      <button id="js-bouton-musique" data-etat="off">
        <span class="nav__musique-icone">♪</span>
        <span class="nav__musique-libelle" aria-hidden="true"></span>
      </button>
    `;
  });

  it('affiche l’état off sans charger musique.js', () => {
    initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    expect(btn.dataset.etat).toBe('off');
    expect(mocksMusique.initialiserMusique).not.toHaveBeenCalled();
  });

  it('affiche PRÊT si la préférence était active', () => {
    localStorage.setItem('portfolio_musique_active', 'true');
    initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    expect(btn.dataset.etat).toBe('pret');
    expect(btn.querySelector('.nav__musique-libelle').textContent).toBe('PRÊT');
    expect(mocksMusique.initialiserMusique).not.toHaveBeenCalled();
  });

  it('charge musique.js au clic sur le bouton', async () => {
    initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(mocksMusique.initialiserMusique).toHaveBeenCalled());
    expect(mocksMusique.basculerMusique).toHaveBeenCalled();
  });

  it('charge musique.js pour le jingle victoire', async () => {
    jouerJingleVictoire();
    await vi.waitFor(() => expect(mocksMusique.jouerJingleVictoire).toHaveBeenCalled());
  });

  it('charge musique.js pour le jingle secret', async () => {
    jouerJingleSecret();
    await vi.waitFor(() => expect(mocksMusique.jouerJingleSecret).toHaveBeenCalled());
  });

  it('active la musique à la première interaction si préférence PRÊT', async () => {
    localStorage.setItem('portfolio_musique_active', 'true');
    initialiserMusique();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.waitFor(() => expect(mocksMusique.activerMusique).toHaveBeenCalled());
  });

  it('active la musique au keydown si préférence PRÊT', async () => {
    localStorage.setItem('portfolio_musique_active', 'true');
    initialiserMusique();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await vi.waitFor(() => expect(mocksMusique.activerMusique).toHaveBeenCalled());
  });

  it('ignore un second appel initialiserMusique', () => {
    initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    expect(btn.dataset.musiqueLoader).toBe('1');
    initialiserMusique();
    expect(btn.dataset.musiqueLoader).toBe('1');
    expect(mocksMusique.initialiserMusique).not.toHaveBeenCalled();
  });

  it('ne fait rien sans bouton musique', () => {
    document.body.innerHTML = '';
    expect(() => initialiserMusique()).not.toThrow();
  });

  it('ignore le premier clic si le bouton est déjà branché', async () => {
    initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    btn.dataset.branche = '1';
    btn.click();
    await Promise.resolve();
    expect(mocksMusique.basculerMusique).not.toHaveBeenCalled();
  });

  it('n’active pas via document si le clic vient du bouton (préférence PRÊT)', async () => {
    localStorage.setItem('portfolio_musique_active', 'true');
    initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(mocksMusique.basculerMusique).toHaveBeenCalled());
    expect(mocksMusique.activerMusique).not.toHaveBeenCalled();
  });
});
