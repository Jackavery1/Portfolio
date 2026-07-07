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

const SEQ = [
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

function saisirSequence() {
  SEQ.forEach((key) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
  });
}

describe('konami', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="js-modal" hidden></div>';
    document.body.classList.remove('konami-actif');
    vi.clearAllMocks();
    scoreMocks.lireScore.mockReturnValue(0);
    initialiserCodeKonami();
  });

  it('active le mode Konami à la séquence complète', () => {
    saisirSequence();

    expect(document.body.classList.contains('konami-actif')).toBe(true);
    expect(scoreMocks.sauvegarderScore).toHaveBeenCalledWith(9999);
  });

  it('désactive le mode Konami à la seconde séquence', () => {
    saisirSequence();
    saisirSequence();
    expect(document.body.classList.contains('konami-actif')).toBe(false);
  });

  it('ignore la séquence si la modale est ouverte', () => {
    document.getElementById('js-modal').hidden = false;
    saisirSequence();
    expect(document.body.classList.contains('konami-actif')).toBe(false);
  });

  it('ignore la séquence dans un champ de saisie', () => {
    document.body.innerHTML =
      '<div id="js-modal" hidden></div><input id="champ" /><div id="js-modal" hidden></div>';
    document.getElementById('champ').focus();
    saisirSequence();
    expect(document.body.classList.contains('konami-actif')).toBe(false);
  });

  it('n’écrit pas le score si le plafond est déjà atteint', () => {
    scoreMocks.lireScore.mockReturnValue(9999);
    saisirSequence();
    expect(scoreMocks.sauvegarderScore).not.toHaveBeenCalled();
  });
});
