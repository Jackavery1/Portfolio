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

vi.mock('./musique-loader.js', () => ({
  jouerJingleSecret: vi.fn(),
}));

vi.mock('./score.js', () => scoreMocks);

import { reinitialiserSaisieKonami } from '../utils/konami-buffer.js';
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
    delete document.documentElement.dataset.konamiInit;
    reinitialiserSaisieKonami();
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

  it('ignore la séquence dans un SELECT', () => {
    document.body.innerHTML =
      '<div id="js-modal" hidden></div><select id="liste"><option>a</option></select>';
    document.getElementById('liste').focus();
    saisirSequence();
    expect(document.body.classList.contains('konami-actif')).toBe(false);
  });

  it('ignore la séquence dans un contentEditable', () => {
    document.body.innerHTML = '<div id="js-modal" hidden></div><div id="edit"></div>';
    const edit = document.getElementById('edit');
    Object.defineProperty(edit, 'isContentEditable', { configurable: true, get: () => true });
    edit.tabIndex = 0;
    edit.focus();
    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => edit,
    });
    saisirSequence();
    expect(document.body.classList.contains('konami-actif')).toBe(false);
    Reflect.deleteProperty(document, 'activeElement');
  });

  it('ignore une seconde initialisation', () => {
    expect(document.documentElement.dataset.konamiInit).toBe('1');
    initialiserCodeKonami();
    expect(document.documentElement.dataset.konamiInit).toBe('1');
  });
});
