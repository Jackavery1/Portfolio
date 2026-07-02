/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SELECTORS: {
      POPUP_HS: 'js-popup-hs',
      POPUP_HS_FERMER: 'js-popup-hs-fermer',
    },
    STORAGE: {
      SCORE_KEY: 'portfolio-score',
      HS_POPUP_VU: 'portfolio-hs-popup-vu',
    },
  },
}));

vi.mock('./audio.js', () => ({
  jouerFanfareVictoire: vi.fn(),
}));

vi.mock('./score-session.js', () => ({
  lireScore: vi.fn(() => 9999),
}));

import { afficherPopupHighScore, initPopupHighScoreFermer } from './popup-highscore.js';

describe('popup-highscore', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ecran" id="ecran"></div>
      <div class="popup-highscore" id="js-popup-hs" hidden role="dialog" aria-modal="true">
        <div class="popup-highscore__boite">
          <span class="popup-highscore__score"></span>
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
    initPopupHighScoreFermer();
    afficherPopupHighScore();
    document.getElementById('js-popup-hs').click();
    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
    expect(document.getElementById('ecran').hasAttribute('inert')).toBe(false);
  });

  it('ferme avec Escape', () => {
    initPopupHighScoreFermer();
    afficherPopupHighScore();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
  });

  it('marque le popup comme vu en sessionStorage', () => {
    afficherPopupHighScore();
    expect(sessionStorage.getItem('portfolio-hs-popup-vu')).toBe('1');
  });
});
