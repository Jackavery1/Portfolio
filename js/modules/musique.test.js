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

function mockThemesFetch() {
  const motifVide = Array.from({ length: 8 }, () => Array(16).fill(0));
  const theme = (bpm = 128) => ({
    bpm,
    facteurTempo: 1,
    basse: motifVide,
    melodie: motifVide,
    arpege: motifVide,
    kick: motifVide,
    snare: motifVide,
    hat: motifVide,
  });
  const themes = {
    HOME: theme(128),
    WORK: theme(128),
    STATS: theme(128),
    STORY: theme(128),
    DOJO: theme(140),
  };
  const themeParSection = {
    accueil: 'HOME',
    projets: 'WORK',
    competences: 'STATS',
    parcours: 'STORY',
    dojo: 'DOJO',
    contact: 'HOME',
    mentions: 'HOME',
  };
  const themeParFichier = {
    'index.html': 'HOME',
    'projets.html': 'WORK',
    'competences.html': 'STATS',
    'parcours.html': 'STORY',
    'dojo.html': 'DOJO',
    'contact.html': 'HOME',
    'mentions-legales.html': 'HOME',
  };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          THEMES: themes,
          THEME_PAR_SECTION: themeParSection,
          THEME_PAR_FICHIER: themeParFichier,
        }),
    })
  );
}

describe('musique', () => {
  let mockCtx;
  let musique;
  let sequencuer;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    vi.clearAllMocks();
    mockThemesFetch();
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
    sequencuer = await import('./musique-sequencuer.js');
  });

  it('initialise le bouton en état discret par défaut (icône seule)', () => {
    musique.initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    expect(btn.dataset.etat).toBe('off');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(btn.querySelector('.nav__musique-libelle').textContent).toBe('');
    expect(btn.getAttribute('title')).toBe('Activer la musique arcade');
  });

  it('active la musique au clic sur le bouton', async () => {
    musique.initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    btn.click();
    await vi.waitFor(() => expect(btn.dataset.etat).toBe('on'), { timeout: 5000 });
    await vi.waitFor(() => expect(mockCtx.resume).toHaveBeenCalled());
    expect(sequencuer.estMusiqueActive()).toBe(true);
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
    await vi.waitFor(() => expect(sequencuer.estMusiqueActive()).toBe(true));
    const appels = mockCtx.createOscillator.mock.calls.length;
    musique.jouerJingleVictoire();
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThan(appels);
  });

  it('joue le jingle secret Konami', () => {
    musique.initialiserMusique();
    musique.jouerJingleSecret();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });

  it('coupe la musique au second clic sur le bouton', async () => {
    musique.initialiserMusique();
    const btn = document.getElementById('js-bouton-musique');
    btn.click();
    await vi.waitFor(() => expect(sequencuer.estMusiqueActive()).toBe(true));
    btn.click();
    await vi.waitFor(() => expect(sequencuer.estMusiqueActive()).toBe(false));
    expect(btn.dataset.etat).toBe('off');
    expect(localStorage.getItem('portfolio_musique_active')).toBe('false');
  });

  it('definirTheme accepte un thème connu après chargement', async () => {
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(sequencuer.estMusiqueActive()).toBe(true));
    sequencuer.definirTheme('WORK');
    sequencuer.definirTheme('INCONNU');
  });

  it('conserve la préférence si resume échoue', async () => {
    mockCtx.resume.mockRejectedValueOnce(new Error('autoplay'));
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(mockCtx.resume).toHaveBeenCalled());
    expect(sequencuer.estMusiqueActive()).toBe(true);
    expect(document.getElementById('js-bouton-musique').dataset.etat).toBe('on');
    expect(localStorage.getItem('portfolio_musique_active')).toBe('true');
  });

  it('ne joue pas de blip nav si le contexte est suspendu', async () => {
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(sequencuer.estMusiqueActive()).toBe(true));
    mockCtx.state = 'suspended';
    const appels = mockCtx.createOscillator.mock.calls.length;
    musique.jouerBlipNavigation();
    expect(mockCtx.createOscillator.mock.calls.length).toBe(appels);
  });

  it('détecte le thème WORK pour la section projets', async () => {
    document.body.dataset.sectionId = 'projets';
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(sequencuer.lireThemeCourant()).toBe('WORK'));
    expect(sequencuer.estMusiqueActive()).toBe(true);
  });

  it('détecte le thème STATS pour competences (data-section-id)', async () => {
    document.body.dataset.sectionId = 'competences';
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(sequencuer.lireThemeCourant()).toBe('STATS'));
    expect(sequencuer.estMusiqueActive()).toBe(true);
  });

  it('active la préférence même sans contexte audio', async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    vi.resetModules();
    mockThemesFetch();
    const mod = await import('./musique.js');
    const seq = await import('./musique-sequencuer.js');
    await mod.activerMusique();
    expect(seq.estMusiqueActive()).toBe(true);
  });

  it('ignore les jingles sans contexte audio', async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    vi.resetModules();
    mockThemesFetch();
    const mod = await import('./musique.js');
    expect(() => mod.jouerJingleVictoire()).not.toThrow();
    expect(() => mod.jouerJingleSecret()).not.toThrow();
  });

  it('n’initialise qu’une fois le bouton et les bips', () => {
    musique.initialiserMusique();
    musique.initialiserMusique();
    expect(document.getElementById('js-bouton-musique').dataset.branche).toBe('true');
    expect(document.getElementById('js-menu').dataset.bipsBranche).toBe('true');
  });

  it('joue un blip nav au survol quand la musique est active', async () => {
    musique.initialiserMusique();
    document.getElementById('js-bouton-musique').click();
    await vi.waitFor(() => expect(sequencuer.estMusiqueActive()).toBe(true));
    const appels = mockCtx.createOscillator.mock.calls.length;
    document.querySelector('.nav__bouton').dispatchEvent(new MouseEvent('mouseenter'));
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThan(appels);
  });

  it('met à jour le bouton sans planter si absent du DOM', async () => {
    document.getElementById('js-bouton-musique').remove();
    await musique.activerMusique();
    expect(sequencuer.estMusiqueActive()).toBe(true);
  });

  it('utilise la destination directe si le gain maître est absent', () => {
    musique.initialiserMusique();
    musique.jouerJingleSecret();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });
});
