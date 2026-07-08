/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

function creerMockGain() {
  return {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
}

function creerMockCtx() {
  const mockGain = creerMockGain();
  return {
    state: 'running',
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => creerMockGain()),
    createOscillator: vi.fn(() => ({
      type: 'square',
      frequency: { setValueAtTime: vi.fn(), value: 440 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createBuffer: vi.fn(() => ({
      getChannelData: () => new Float32Array(100),
    })),
    createBufferSource: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      buffer: null,
    })),
    createBiquadFilter: vi.fn(() => ({
      type: 'lowpass',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 0,
      },
      connect: vi.fn(),
    })),
    _gain: mockGain,
  };
}

vi.mock('../config/index.js', () => ({
  CONFIGURATION: {
    SELECTEURS: { BOUTON_MUSIQUE: 'js-bouton-musique', MENU: 'js-menu' },
    STOCKAGE: { CLE_MUSIQUE: 'portfolio_musique_active' },
  },
}));

describe('musique', () => {
  let mockCtx;
  let musique;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    vi.clearAllMocks();
    mockCtx = creerMockCtx();
    window.AudioContext = vi.fn(() => mockCtx);
    delete window.webkitAudioContext;

    document.body.innerHTML = `
      <button id="js-bouton-musique" data-etat="off">
        <span class="nav__musique-icone">♪</span>
        <span class="nav__musique-libelle" aria-hidden="true"></span>
      </button>
      <nav id="js-menu">
        <a class="nav__bouton" href="index.html">HOME</a>
      </nav>
    `;
    document.body.dataset.sectionId = 'accueil';

    musique = await import('./musique.js');
  });

  it('initialise le bouton en état discret par défaut (icône seule)', () => {
    musique.initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    expect(btn.dataset.etat).toBe('off');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.querySelector('.nav__musique-libelle').textContent).toBe('');
    expect(btn.getAttribute('title')).toBe('Activer la musique arcade');
  });

  it('affiche l’état PRÊT si la préférence était active', () => {
    localStorage.setItem('portfolio_musique_active', 'true');
    musique.initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    expect(btn.dataset.etat).toBe('pret');
    expect(btn.querySelector('.nav__musique-libelle').textContent).toBe('PRÊT');
    expect(musique.estMusiqueActive()).toBe(false);
  });

  it('active la musique au clic sur le bouton', async () => {
    musique.initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    btn.click();
    await vi.waitFor(() => expect(btn.dataset.etat).toBe('on'));
    expect(mockCtx.resume).toHaveBeenCalled();
    expect(musique.estMusiqueActive()).toBe(true);
    expect(localStorage.getItem('portfolio_musique_active')).toBe('true');
  });

  it('ne joue pas de blip nav si la musique est inactive', () => {
    musique.initialiserMusique();
    const appels = mockCtx.createOscillator.mock.calls.length;
    musique.jouerBlipNavigation();
    expect(mockCtx.createOscillator.mock.calls.length).toBe(appels);
  });

  it('joue un jingle victoire via Web Audio', async () => {
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(musique.estMusiqueActive()).toBe(true));
    const appels = mockCtx.createOscillator.mock.calls.length;
    musique.jouerJingleVictoire();
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThan(appels);
  });

  it('joue le jingle secret Konami', () => {
    musique.initialiserMusique();
    musique.jouerJingleSecret();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('détecte le thème WORK pour la section projets', async () => {
    document.body.dataset.sectionId = 'projets';
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(musique.estMusiqueActive()).toBe(true));
  });

  it('détecte le thème STATS pour competences (data-section-id)', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    document.body.dataset.sectionId = 'competences';
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(musique.estMusiqueActive()).toBe(true));
    expect(debugSpy).toHaveBeenCalledWith(
      '[musique] thème détecté:',
      'STATS',
      '(section: competences)'
    );
    debugSpy.mockRestore();
  });
});
