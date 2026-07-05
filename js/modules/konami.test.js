/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const scoreMocks = vi.hoisted(() => ({
  ajouterScore: vi.fn(),
  afficherPopupMeilleurScore: vi.fn(),
  afficherScore: vi.fn(),
  lireScore: vi.fn(() => 0),
  sauvegarderScore: vi.fn(),
}));

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { MODALE: 'js-modal' },
    KONAMI: {
      SEQUENCE: [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ],
    },
  },
}));

vi.mock('./audio.js', () => ({
  jouerFanfareVictoire: vi.fn(),
}));

vi.mock('./score.js', () => scoreMocks);

import { initialiserCodeKonami } from './konami.js';

describe('konami', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="js-modal" hidden></div>';
    document.body.classList.remove('konami-actif');
    vi.clearAllMocks();
    scoreMocks.lireScore.mockReturnValue(0);
    initialiserCodeKonami();
  });

  it('active le mode Konami à la séquence complète', () => {
    const seq = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    seq.forEach((key) => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(document.body.classList.contains('konami-actif')).toBe(true);
    expect(scoreMocks.sauvegarderScore).toHaveBeenCalledWith(9999);
  });
});
