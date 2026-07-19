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

function creerMockOsc() {
  return {
    type: 'square',
    frequency: { setValueAtTime: vi.fn(), value: 440 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function creerMockCtx() {
  return {
    state: 'running',
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createGain: vi.fn(() => creerMockGain()),
    createOscillator: vi.fn(() => creerMockOsc()),
    createBuffer: vi.fn(() => ({
      getChannelData: () => new Float32Array(8),
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
  };
}

describe('musique-voix', () => {
  let mockCtx;
  let voix;
  const dest = {};

  beforeEach(async () => {
    vi.resetModules();
    mockCtx = creerMockCtx();
    const store = await import('./audio-context-store.js');
    store.reinitialiserEtatAudio();
    store.initialiserContexteAudio(
      function FakeCtx() {
        return mockCtx;
      },
      (ctx) => ctx.createBuffer(1, 8, ctx.sampleRate)
    );
    voix = await import('./musique-voix.js');
  });

  it('ne joue rien sans contexte', async () => {
    const store = await import('./audio-context-store.js');
    store.reinitialiserEtatAudio();
    expect(() => voix.jouerPulse(440, 0, 0.1, dest)).not.toThrow();
    expect(() => voix.jouerKick(0, dest)).not.toThrow();
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('jouerPulse démarre un oscillateur square', () => {
    voix.jouerPulse(523.25, 0, 0.1, dest);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    const osc = mockCtx.createOscillator.mock.results[0].value;
    expect(osc.type).toBe('square');
    expect(osc.start).toHaveBeenCalled();
    expect(osc.stop).toHaveBeenCalled();
  });

  it('jouerPulse avec vibrato ajoute un LFO', () => {
    voix.jouerPulse(440, 0, 0.2, dest, { vibrato: true, amplitude: 0.1 });
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('jouerTriangle démarre un oscillateur triangle', () => {
    voix.jouerTriangle(220, 0, 0.08, dest);
    const osc = mockCtx.createOscillator.mock.results[0].value;
    expect(osc.type).toBe('triangle');
    expect(osc.start).toHaveBeenCalled();
  });

  it('jouerKick / snare / hat utilisent le buffer bruit', () => {
    voix.jouerKick(0, dest);
    voix.jouerSnare(0.1, dest);
    voix.jouerHat(0.2, dest);
    expect(mockCtx.createBufferSource).toHaveBeenCalledTimes(3);
    expect(mockCtx.createBiquadFilter).toHaveBeenCalled();
  });

  it('jouerNappe et jouerBlip délèguent au moteur voix', () => {
    voix.jouerNappe(330, 0, 0.3, dest);
    voix.jouerBlip(0, dest);
    expect(mockCtx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
