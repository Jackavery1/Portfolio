/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: {
      POPUP_HS: 'js-popup-hs',
      POPUP_HS_FERMER: 'js-popup-hs-fermer',
    },
    STOCKAGE: {
      CLE_SCORE: 'portfolio-score',
      POPUP_HS_VU: 'portfolio-hs-popup-vu',
    },
  },
}));

vi.mock('./audio.js', () => ({
  jouerFanfareVictoire: vi.fn(),
}));

vi.mock('../utils/focus.js', () => ({
  piegerTabulationModale: vi.fn(),
}));

vi.mock('./score-session.js', () => ({
  lireScore: vi.fn(() => 9999),
}));

import { piegerTabulationModale } from '../utils/focus.js';
import {
  afficherPopupMeilleurScore,
  initialiserFermeturePopupMeilleurScore,
} from './popup-highscore.js';

describe('popup-highscore', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ecran" id="ecran"></div>
      <div class="popup-highscore" id="js-popup-hs" hidden role="dialog" aria-modal="true">
        <div class="popup-highscore__boite">
          <span class="popup-highscore__score"></span>
          <a class="popup-highscore__btn" href="contact.html">Contact</a>
          <button id="js-popup-hs-fermer" type="button">Fermer</button>
        </div>
      </div>
      <button id="focus-avant" type="button">Avant</button>
    `;
    sessionStorage.clear();
    document.documentElement.removeAttribute('data-hs-popup-escape');
    const popup = document.getElementById('js-popup-hs');
    delete popup.dataset.hsEcouteurs;
    const btn = document.getElementById('js-popup-hs-fermer');
    delete btn.dataset.ecouteurHs;
  });

  it('ferme au clic sur l’overlay', () => {
    initialiserFermeturePopupMeilleurScore();
    afficherPopupMeilleurScore();
    document.getElementById('js-popup-hs').click();
    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
    expect(document.getElementById('ecran').hasAttribute('inert')).toBe(false);
  });

  it('ferme avec Escape', () => {
    initialiserFermeturePopupMeilleurScore();
    afficherPopupMeilleurScore();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    );
    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
  });

  it('marque le popup comme vu en sessionStorage', () => {
    afficherPopupMeilleurScore();
    expect(sessionStorage.getItem('portfolio-hs-popup-vu')).toBe('1');
  });

  it('active inert sur le fond et piège le focus à l’ouverture', () => {
    initialiserFermeturePopupMeilleurScore();
    afficherPopupMeilleurScore();

    const popup = document.getElementById('js-popup-hs');
    const ecran = document.getElementById('ecran');

    expect(popup.hidden).toBe(false);
    expect(ecran.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(document.getElementById('js-popup-hs-fermer'));
  });

  it('conserve le score à la fermeture du popup', () => {
    sessionStorage.setItem('portfolio-score', '9999');
    initialiserFermeturePopupMeilleurScore();
    afficherPopupMeilleurScore();
    document.getElementById('js-popup-hs-fermer')?.click();

    expect(sessionStorage.getItem('portfolio-score')).toBe('9999');
  });

  it('ignore l’affichage si le popup est absent du DOM', () => {
    document.getElementById('js-popup-hs').remove();
    expect(() => afficherPopupMeilleurScore()).not.toThrow();
  });

  it('piège Tab dans le popup ouvert', () => {
    initialiserFermeturePopupMeilleurScore();
    afficherPopupMeilleurScore();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(piegerTabulationModale).toHaveBeenCalled();
  });

  it('ferme le popup avant la navigation vers contact', () => {
    initialiserFermeturePopupMeilleurScore();
    afficherPopupMeilleurScore();

    const lien = document.querySelector('.popup-highscore__btn');
    lien.click();

    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
    expect(document.getElementById('ecran').hasAttribute('inert')).toBe(false);
    expect(lien.getAttribute('href')).toBe('contact.html');
  });
});
