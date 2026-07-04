/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  initAccueilSocial: vi.fn(),
  initProjetsGrille: vi.fn(),
  initModalClavier: vi.fn(),
  initModalClicks: vi.fn(),
  initDojoBoss: vi.fn(),
  initContactPage: vi.fn().mockResolvedValue(undefined),
  initMentionsLegales: vi.fn(),
  enregistrerServiceWorker: vi.fn(),
  afficherPopupHighScore: vi.fn(),
  chargerPartials: vi.fn().mockResolvedValue(undefined),
  initNavigationArcade: vi.fn(),
  initNavigationClavier: vi.fn(),
  annoncerNavigationClavier: vi.fn(),
  afficherScore: vi.fn(),
  initPopupHighScoreFermer: vi.fn(),
  lireScore: vi.fn(() => 0),
  initMetaPartage: vi.fn(),
  initBonusScore: vi.fn(),
  initKonamiCode: vi.fn(),
  animerBarresSection: vi.fn(),
  initContactCoordonnees: vi.fn(),
}));

vi.mock('./modules/partials.js', () => ({
  chargerPartials: mocks.chargerPartials,
}));

vi.mock('./modules/navigation.js', () => ({
  initNavigationArcade: mocks.initNavigationArcade,
  initNavigationClavier: mocks.initNavigationClavier,
  annoncerNavigationClavier: mocks.annoncerNavigationClavier,
}));

vi.mock('./modules/score.js', () => ({
  afficherPopupHighScore: mocks.afficherPopupHighScore,
  afficherScore: mocks.afficherScore,
  initPopupHighScoreFermer: mocks.initPopupHighScoreFermer,
  lireScore: mocks.lireScore,
}));

vi.mock('./modules/meta.js', () => ({
  initMetaPartage: mocks.initMetaPartage,
  initBonusScore: mocks.initBonusScore,
}));

vi.mock('./modules/konami.js', () => ({
  initKonamiCode: mocks.initKonamiCode,
}));

vi.mock('./modules/animations.js', () => ({
  animerBarresSection: mocks.animerBarresSection,
}));

vi.mock('./modules/contact-coordonnees.js', () => ({
  initContactCoordonnees: mocks.initContactCoordonnees,
}));

vi.mock('./modules/service-worker-register.js', () => ({
  enregistrerServiceWorker: mocks.enregistrerServiceWorker,
}));

vi.mock('./modules/accueil-social.js', () => ({
  initAccueilSocial: mocks.initAccueilSocial,
}));

vi.mock('./modules/projets-grille.js', () => ({
  initProjetsGrille: mocks.initProjetsGrille,
}));

vi.mock('./modules/modal.js', () => ({
  initModalClavier: mocks.initModalClavier,
  initModalClicks: mocks.initModalClicks,
}));

vi.mock('./modules/dojo-boss.js', () => ({
  initDojoBoss: mocks.initDojoBoss,
}));

vi.mock('./modules/contact.js', () => ({
  initContactPage: mocks.initContactPage,
}));

vi.mock('./modules/mentions-legales.js', () => ({
  initMentionsLegales: mocks.initMentionsLegales,
}));

import { init } from './main.js';

describe('main', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="js-popup-hs" hidden></div>';
    document.body.dataset.sectionId = 'accueil';
    delete document.body.dataset.appReady;
    vi.clearAllMocks();
    vi.useFakeTimers();
    sessionStorage.clear();
    mocks.lireScore.mockReturnValue(0);
    mocks.initContactPage.mockResolvedValue(undefined);
  });

  it('charge les partials et initialise le socle commun', async () => {
    await init();
    vi.runAllTimers();

    expect(mocks.chargerPartials).toHaveBeenCalled();
    expect(mocks.annoncerNavigationClavier).toHaveBeenCalled();
    expect(mocks.initContactCoordonnees).toHaveBeenCalled();
    expect(mocks.initNavigationArcade).toHaveBeenCalled();
    expect(mocks.initNavigationClavier).toHaveBeenCalled();
    expect(mocks.enregistrerServiceWorker).toHaveBeenCalled();
    expect(document.body.dataset.appReady).toBe('true');
  });

  it('ajoute la favicon en dev si absente du head', async () => {
    await init();

    expect(document.querySelector('link[rel="icon"][type="image/png"]')).not.toBeNull();
  });

  it('ne duplique pas la favicon si elle existe déjà', async () => {
    const existante = document.createElement('link');
    existante.rel = 'icon';
    existante.type = 'image/png';
    existante.href = 'assets/favicon.png';
    document.head.appendChild(existante);

    await init();

    expect(document.querySelectorAll('link[rel="icon"][type="image/png"]')).toHaveLength(1);
  });

  it('masque le popup high score au démarrage', async () => {
    document.body.innerHTML = '<div id="js-popup-hs"></div>';

    await init();

    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
  });

  it('utilise accueil comme section par défaut', async () => {
    delete document.body.dataset.sectionId;

    await init();

    expect(mocks.initAccueilSocial).toHaveBeenCalled();
  });

  it('n’initialise que le socle commun sur la section parcours', async () => {
    document.body.dataset.sectionId = 'parcours';
    await init();
    vi.advanceTimersByTime(300);

    expect(mocks.initAccueilSocial).not.toHaveBeenCalled();
    expect(mocks.initProjetsGrille).not.toHaveBeenCalled();
    expect(mocks.animerBarresSection).toHaveBeenCalledWith('parcours');
  });

  it('tolère sessionStorage indisponible pour le popup high score', async () => {
    mocks.lireScore.mockReturnValue(9999);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });

    await expect(init()).resolves.toBeUndefined();
    vi.runAllTimers();

    expect(document.body.dataset.appReady).toBe('true');
  });

  it('initialise accueil-social sur la section accueil', async () => {
    document.body.dataset.sectionId = 'accueil';
    await init();

    expect(mocks.initAccueilSocial).toHaveBeenCalled();
    expect(mocks.initProjetsGrille).not.toHaveBeenCalled();
  });

  it('initialise projets et modale sur la section projets', async () => {
    document.body.dataset.sectionId = 'projets';
    await init();

    expect(mocks.initProjetsGrille).toHaveBeenCalled();
    expect(mocks.initModalClavier).toHaveBeenCalled();
    expect(mocks.initModalClicks).toHaveBeenCalled();
  });

  it('initialise dojo-boss sur la section dojo', async () => {
    document.body.dataset.sectionId = 'dojo';
    await init();

    expect(mocks.initDojoBoss).toHaveBeenCalled();
  });

  it('initialise la page contact via la facade', async () => {
    document.body.dataset.sectionId = 'contact';
    await init();

    expect(mocks.initContactPage).toHaveBeenCalled();
  });

  it('initialise mentions-legales sur la section mentions', async () => {
    document.body.dataset.sectionId = 'mentions';
    await init();

    expect(mocks.initMentionsLegales).toHaveBeenCalled();
  });

  it('affiche le popup high score si le score était déjà au max', async () => {
    mocks.lireScore.mockReturnValue(9999);
    await init();
    vi.runAllTimers();

    expect(mocks.afficherPopupHighScore).toHaveBeenCalled();
  });

  it('n’affiche pas le popup high score si déjà vu en session', async () => {
    mocks.lireScore.mockReturnValue(9999);
    sessionStorage.setItem('hs_popup_vu', '1');
    await init();
    vi.runAllTimers();

    expect(mocks.afficherPopupHighScore).not.toHaveBeenCalled();
  });

  it('anime les barres de section après un délai', async () => {
    document.body.dataset.sectionId = 'competences';
    await init();
    vi.advanceTimersByTime(300);

    expect(mocks.animerBarresSection).toHaveBeenCalledWith('competences');
  });
});
