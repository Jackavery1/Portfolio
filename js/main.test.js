/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  initialiserAccueilSocial: vi.fn(),
  initialiserGrilleProjets: vi.fn(),
  initialiserClavierModale: vi.fn(),
  initialiserClicsModale: vi.fn(),
  initialiserDojoBoss: vi.fn(),
  initialiserPageContact: vi.fn().mockResolvedValue(undefined),
  initialiserMentionsLegales: vi.fn(),
  enregistrerServiceWorker: vi.fn(),
  afficherPopupMeilleurScore: vi.fn(),
  chargerPartiels: vi.fn().mockResolvedValue(undefined),
  initialiserNavigationArcade: vi.fn(),
  initialiserNavigationClavier: vi.fn(),
  annoncerNavigationClavier: vi.fn(),
  afficherScore: vi.fn(),
  initialiserFermeturePopupMeilleurScore: vi.fn(),
  lireScore: vi.fn(() => 0),
  initialiserMetaPartage: vi.fn(),
  initialiserBonusScore: vi.fn(),
  initialiserCodeKonami: vi.fn(),
  initialiserMusique: vi.fn(),
  animerBarresSection: vi.fn(),
}));

vi.mock('./modules/partials.js', () => ({
  chargerPartiels: mocks.chargerPartiels,
}));

vi.mock('./modules/navigation.js', () => ({
  initialiserNavigationArcade: mocks.initialiserNavigationArcade,
  initialiserNavigationClavier: mocks.initialiserNavigationClavier,
  annoncerNavigationClavier: mocks.annoncerNavigationClavier,
}));

vi.mock('./modules/score.js', () => ({
  afficherPopupMeilleurScore: mocks.afficherPopupMeilleurScore,
  afficherScore: mocks.afficherScore,
  initialiserFermeturePopupMeilleurScore: mocks.initialiserFermeturePopupMeilleurScore,
  lireScore: mocks.lireScore,
}));

vi.mock('./modules/meta.js', () => ({
  initialiserMetaPartage: mocks.initialiserMetaPartage,
  initialiserBonusScore: mocks.initialiserBonusScore,
}));

vi.mock('./modules/konami.js', () => ({
  initialiserCodeKonami: mocks.initialiserCodeKonami,
}));

vi.mock('./modules/musique-loader.js', () => ({
  initialiserMusique: mocks.initialiserMusique,
}));

vi.mock('./modules/animations.js', () => ({
  animerBarresSection: mocks.animerBarresSection,
}));

vi.mock('./modules/service-worker-register.js', () => ({
  enregistrerServiceWorker: mocks.enregistrerServiceWorker,
}));

vi.mock('./modules/accueil-social.js', () => ({
  initialiserAccueilSocial: mocks.initialiserAccueilSocial,
}));

vi.mock('./modules/projets-grille.js', () => ({
  initialiserGrilleProjets: mocks.initialiserGrilleProjets,
}));

vi.mock('./modules/modal.js', () => ({
  initialiserClavierModale: mocks.initialiserClavierModale,
  initialiserClicsModale: mocks.initialiserClicsModale,
}));

vi.mock('./modules/dojo-boss.js', () => ({
  initialiserDojoBoss: mocks.initialiserDojoBoss,
}));

vi.mock('./modules/contact.js', () => ({
  initialiserPageContact: mocks.initialiserPageContact,
}));

vi.mock('./modules/mentions-legales.js', () => ({
  initialiserMentionsLegales: mocks.initialiserMentionsLegales,
}));

import { initialiser } from './main.js';

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
    mocks.initialiserPageContact.mockResolvedValue(undefined);
  });

  it('charge les partials et initialise le socle commun', async () => {
    await initialiser();
    vi.runAllTimers();

    expect(mocks.chargerPartiels).toHaveBeenCalled();
    expect(mocks.annoncerNavigationClavier).toHaveBeenCalled();
    expect(mocks.initialiserNavigationArcade).toHaveBeenCalled();
    expect(mocks.initialiserNavigationClavier).toHaveBeenCalled();
    expect(mocks.initialiserMusique).toHaveBeenCalled();
    expect(mocks.enregistrerServiceWorker).toHaveBeenCalled();
    expect(document.body.dataset.appReady).toBe('true');
  });

  it('ajoute la favicon en dev si absente du head', async () => {
    await initialiser();

    expect(document.querySelector('link[rel="icon"][type="image/png"]')).not.toBeNull();
  });

  it('ne duplique pas la favicon si elle existe déjà', async () => {
    const existante = document.createElement('link');
    existante.rel = 'icon';
    existante.type = 'image/png';
    existante.href = 'assets/favicon.png';
    document.head.appendChild(existante);

    await initialiser();

    expect(document.querySelectorAll('link[rel="icon"][type="image/png"]')).toHaveLength(1);
  });

  it('masque le popup high score au démarrage', async () => {
    document.body.innerHTML = '<div id="js-popup-hs"></div>';

    await initialiser();

    expect(document.getElementById('js-popup-hs').hidden).toBe(true);
  });

  it('utilise accueil comme section par défaut', async () => {
    delete document.body.dataset.sectionId;

    await initialiser();

    expect(mocks.initialiserAccueilSocial).toHaveBeenCalled();
  });

  it('n’initialise que le socle commun sur la section parcours', async () => {
    document.body.dataset.sectionId = 'parcours';
    await initialiser();
    vi.advanceTimersByTime(300);

    expect(mocks.initialiserAccueilSocial).not.toHaveBeenCalled();
    expect(mocks.initialiserGrilleProjets).not.toHaveBeenCalled();
    expect(mocks.animerBarresSection).toHaveBeenCalledWith('parcours');
  });

  it('tolère sessionStorage indisponible pour le popup high score', async () => {
    mocks.lireScore.mockReturnValue(9999);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });

    await expect(initialiser()).resolves.toBeUndefined();
    vi.runAllTimers();

    expect(document.body.dataset.appReady).toBe('true');
  });

  it('initialise accueil-social sur la section accueil', async () => {
    document.body.dataset.sectionId = 'accueil';
    await initialiser();

    expect(mocks.initialiserAccueilSocial).toHaveBeenCalled();
    expect(mocks.initialiserGrilleProjets).not.toHaveBeenCalled();
  });

  it('initialise projets et modale sur la section projets', async () => {
    document.body.dataset.sectionId = 'projets';
    await initialiser();

    expect(mocks.initialiserGrilleProjets).toHaveBeenCalled();
    expect(mocks.initialiserClavierModale).toHaveBeenCalled();
    expect(mocks.initialiserClicsModale).toHaveBeenCalled();
  });

  it('initialise dojo-boss sur la section dojo', async () => {
    document.body.dataset.sectionId = 'dojo';
    await initialiser();

    expect(mocks.initialiserDojoBoss).toHaveBeenCalled();
  });

  it('initialise la page contact via la facade', async () => {
    document.body.dataset.sectionId = 'contact';
    await initialiser();

    expect(mocks.initialiserPageContact).toHaveBeenCalled();
  });

  it('initialise mentions-legales sur la section mentions', async () => {
    document.body.dataset.sectionId = 'mentions';
    await initialiser();

    expect(mocks.initialiserMentionsLegales).toHaveBeenCalled();
  });

  it('affiche le popup high score si le score était déjà au max', async () => {
    mocks.lireScore.mockReturnValue(9999);
    await initialiser();
    vi.runAllTimers();

    expect(mocks.afficherPopupMeilleurScore).toHaveBeenCalled();
  });

  it('n’affiche pas le popup high score si déjà vu en session', async () => {
    mocks.lireScore.mockReturnValue(9999);
    sessionStorage.setItem('hs_popup_vu', '1');
    await initialiser();
    vi.runAllTimers();

    expect(mocks.afficherPopupMeilleurScore).not.toHaveBeenCalled();
  });

  it('anime les barres de section après un délai', async () => {
    document.body.dataset.sectionId = 'competences';
    await initialiser();
    vi.advanceTimersByTime(300);

    expect(mocks.animerBarresSection).toHaveBeenCalledWith('competences');
  });
});
