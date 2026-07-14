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
      Q: { value: 1 },
      connect: vi.fn(),
    })),
    _gain: mockGain,
  };
}

describe('musique-audio', () => {
  let mockCtx;
  let audioMod;

  beforeEach(async () => {
    vi.resetModules();
    mockCtx = creerMockCtx();
    window.AudioContext = vi.fn(() => mockCtx);
    delete window.webkitAudioContext;
    const store = await import('./audio-context-store.js');
    store.reinitialiserEtatAudio();
    audioMod = await import('./musique-audio.js');
  });

  it('initialise le contexte et le gain maître', () => {
    expect(audioMod.obtenirContexte()).toBe(mockCtx);
    expect(audioMod.obtenirGainMaitre()).toBeTruthy();
  });

  it('assurerContexteActif reprend un contexte suspendu', () => {
    audioMod.obtenirContexte();
    mockCtx.state = 'suspended';
    mockCtx.resume.mockClear();
    expect(audioMod.assurerContexteActif()).toBe(mockCtx);
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  it('joue pulse, triangle, nappe et percussions', () => {
    const ctx = audioMod.obtenirContexte();
    const destination = audioMod.obtenirGainMaitre();
    audioMod.jouerPulse(440, 0, 0.1, destination, { vibrato: true, amplitude: 0.2 });
    audioMod.jouerTriangle(220, 0, 0.1, destination);
    audioMod.jouerNappe(330, 0, 0.2, destination);
    audioMod.jouerKick(0, destination);
    audioMod.jouerSnare(0, destination);
    audioMod.jouerHat(0, destination, 0.1);
    audioMod.jouerBlip(0, destination);
    expect(ctx.createOscillator).toHaveBeenCalled();
    expect(ctx.createBufferSource).toHaveBeenCalled();
  });

  it('ignore les fréquences nulles', () => {
    const destination = audioMod.obtenirGainMaitre();
    const appels = mockCtx.createOscillator.mock.calls.length;
    audioMod.jouerPulse(0, 0, 0.1, destination);
    audioMod.jouerTriangle(null, 0, 0.1, destination);
    expect(mockCtx.createOscillator.mock.calls.length).toBe(appels);
  });

  it('retourne null sans constructeur AudioContext', async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    vi.resetModules();
    const mod = await import('./musique-audio.js');
    expect(mod.obtenirContexte()).toBeNull();
  });

  it('suspend le contexte en cours', async () => {
    audioMod.obtenirContexte();
    await audioMod.suspendreContexte();
    expect(mockCtx.suspend).toHaveBeenCalled();
  });

  it('ignore suspendre si le contexte n’est pas actif', async () => {
    mockCtx.state = 'suspended';
    audioMod.obtenirContexte();
    mockCtx.suspend.mockClear();
    await audioMod.suspendreContexte();
    expect(mockCtx.suspend).not.toHaveBeenCalled();
  });

  it('utilise webkitAudioContext en repli', async () => {
    delete window.AudioContext;
    window.webkitAudioContext = vi.fn(() => mockCtx);
    vi.resetModules();
    const mod = await import('./musique-audio.js');
    expect(mod.obtenirContexte()).toBe(mockCtx);
    expect(window.webkitAudioContext).toHaveBeenCalled();
  });

  it('retourne null si la création du contexte échoue', async () => {
    window.AudioContext = vi.fn(() => {
      throw new Error('indisponible');
    });
    vi.resetModules();
    const mod = await import('./musique-audio.js');
    expect(mod.obtenirContexte()).toBeNull();
  });

  it('ignore une erreur de suspend', async () => {
    mockCtx.suspend.mockRejectedValueOnce(new Error('refusé'));
    audioMod.obtenirContexte();
    await expect(audioMod.suspendreContexte()).resolves.toBeUndefined();
  });

  it('expose l’état du contexte audio', () => {
    audioMod.obtenirContexte();
    expect(audioMod.obtenirEtatContexte()).toBe('running');
  });

  it('journalise si la reprise du contexte suspendu échoue', async () => {
    vi.stubGlobal('location', { hostname: 'localhost' });
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    audioMod.obtenirContexte();
    mockCtx.state = 'suspended';
    mockCtx.resume.mockRejectedValueOnce(new Error('policy'));
    audioMod.reprendreContexteSiSuspendu();
    await Promise.resolve();
    expect(debug).toHaveBeenCalledWith('[audio] reprise AudioContext refusée', expect.any(Error));
    debug.mockRestore();
  });

  it('assurerContexteActif retourne null sans AudioContext', async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    vi.resetModules();
    const mod = await import('./musique-audio.js');
    expect(mod.assurerContexteActif()).toBeNull();
  });

  it('ignore les percussions sans contexte initialisé', async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    vi.resetModules();
    const mod = await import('./musique-audio.js');
    expect(() => {
      mod.jouerKick(0, {});
      mod.jouerSnare(0, {});
      mod.jouerHat(0, {});
      mod.jouerPulse(440, 0, 0.1, {});
    }).not.toThrow();
  });

  it('joue un blip sans vibrato optionnel', () => {
    audioMod.obtenirContexte();
    const destination = audioMod.obtenirGainMaitre();
    audioMod.jouerBlip(0, destination, 660, 0.02, 0.08);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });
});
