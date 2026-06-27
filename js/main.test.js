/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./modules/partials.js', () => ({
  chargerPartials: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./modules/navigation.js', () => ({
  initNavigationArcade: vi.fn(),
  initNavigationClavier: vi.fn(),
}));

vi.mock('./modules/score.js', () => ({
  afficherPopupHighScore: vi.fn(),
  afficherScore: vi.fn(),
  initPopupHighScoreFermer: vi.fn(),
  lireScore: vi.fn(() => 0),
}));

vi.mock('./modules/meta.js', () => ({
  initMetaPartage: vi.fn(),
  initBonusScore: vi.fn(),
}));

vi.mock('./modules/konami.js', () => ({
  initKonamiCode: vi.fn(),
}));

vi.mock('./modules/animations.js', () => ({
  animerBarresSection: vi.fn(),
}));

vi.mock('./modules/contact-coordonnees.js', () => ({
  initContactCoordonnees: vi.fn(),
}));

import { init } from './main.js';
import { chargerPartials } from './modules/partials.js';

describe('main', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.body.dataset.sectionId = 'accueil';
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('charge les partials au démarrage', async () => {
    await init();
    vi.runAllTimers();

    expect(chargerPartials).toHaveBeenCalled();
  });
});
