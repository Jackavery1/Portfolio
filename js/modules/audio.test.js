/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('audio', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('expose la fanfare victoire standard', async () => {
    const { FANFARE_VICTOIRE } = await import('./audio.js');
    expect(FANFARE_VICTOIRE).toEqual([523, 659, 784, 1047]);
  });

  it('jouerFanfareVictoire ne lève pas sans AudioContext', async () => {
    const { jouerFanfareVictoire } = await import('./audio.js');
    expect(() => jouerFanfareVictoire()).not.toThrow();
  });

  it('jouerBip utilise Web Audio quand disponible', async () => {
    const start = vi.fn();
    const stop = vi.fn();
    const osc = {
      type: 'square',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start,
      stop,
    };
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
    };
    const ctx = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60, 'square');
    expect(start).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('reprend un contexte suspendu', async () => {
    const ctx = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
      })),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    jouerBip(220, 40);
    expect(ctx.resume).toHaveBeenCalled();
  });

  it('utilise webkitAudioContext en secours', async () => {
    const WebkitCtx = vi.fn(() => ({
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
      })),
      resume: vi.fn().mockResolvedValue(undefined),
    }));

    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', WebkitCtx);

    const { jouerBip } = await import('./audio.js');
    jouerBip(300, 50);
    expect(WebkitCtx).toHaveBeenCalled();
  });

  it('jouerBip ignore les erreurs Web Audio', async () => {
    const ctx = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => {
        throw new Error('fail');
      }),
      createGain: vi.fn(),
      resume: vi.fn(),
    };
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );
    vi.resetModules();
    const { jouerBip } = await import('./audio.js');
    expect(() => jouerBip(440, 60)).not.toThrow();
  });

  it('jouerFanfareVictoire planifie plusieurs bips', async () => {
    vi.useFakeTimers();
    const start = vi.fn();
    const ctx = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start,
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
      })),
      resume: vi.fn().mockResolvedValue(undefined),
    };
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );
    vi.resetModules();

    const { jouerFanfareVictoire } = await import('./audio.js');
    jouerFanfareVictoire({ delais: [0, 10, 20, 30] });
    await vi.runAllTimersAsync();
    expect(start.mock.calls.length).toBeGreaterThanOrEqual(4);
  });
});
