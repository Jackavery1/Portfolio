import { vi } from 'vitest';

export function creerOscillateurMock({ start = vi.fn(), stop = vi.fn() } = {}) {
  return {
    type: 'square',
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    start,
    stop,
  };
}

export function creerMockCtxAudio(surcharge = {}) {
  return {
    state: 'running',
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(() => creerOscillateurMock()),
    createGain: vi.fn(() => ({
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn().mockReturnThis(),
    })),
    createBuffer: vi.fn(() => ({
      getChannelData: () => new Float32Array(100),
    })),
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    ...surcharge,
  };
}

export function creerCtxAvecOscillateur({ start, stop, surchargeCtx = {} } = {}) {
  const oscillateur = creerOscillateurMock({ start, stop });
  return creerMockCtxAudio({
    createOscillator: vi.fn(() => oscillateur),
    ...surchargeCtx,
  });
}

export function stubAudioContext(ctx) {
  vi.stubGlobal(
    'AudioContext',
    vi.fn(() => ctx)
  );
}
