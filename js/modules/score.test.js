/* @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../config/index.js', () => ({
  CONFIG: {
    SELECTORS: {
      POPUP_HS: 'js-popup-hs',
      POPUP_HS_FERMER: 'js-popup-hs-fermer',
      SCORE: 'js-score',
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

import { afficherPopupMeilleurScore, initialiserFermeturePopupMeilleurScore } from './score.js';

describe('score popup high score', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="ecran" id="ecran"></div>
      <div class="popup-highscore" id="js-popup-hs" hidden role="dialog" aria-modal="true">
        <div class="popup-highscore__boite">
          <div class="popup-highscore__score"></div>
          <a class="popup-highscore__btn" href="contact.html">Contact</a>
          <button id="js-popup-hs-fermer" type="button">Fermer</button>
        </div>
      </div>
    `;
    sessionStorage.clear();
    document.documentElement.removeAttribute('data-hs-popup-escape');
    const popup = document.getElementById('js-popup-hs');
    if (popup) delete popup.dataset.hsEcouteurs;
    const btn = document.getElementById('js-popup-hs-fermer');
    if (btn) delete btn.dataset.ecouteurHs;
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
});
