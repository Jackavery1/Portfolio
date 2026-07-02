/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FANFARE_VICTOIRE, jouerBip, jouerFanfareVictoire } from './audio.js';

describe('audio', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('expose la fanfare victoire standard', () => {
    expect(FANFARE_VICTOIRE).toEqual([523, 659, 784, 1047]);
  });

  it('jouerFanfareVictoire ne lève pas sans AudioContext', () => {
    expect(() => jouerFanfareVictoire()).not.toThrow();
  });

  it('jouerBip utilise Web Audio quand disponible', () => {
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

    jouerBip(440, 60, 'square');
    expect(start).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('jouerFanfareVictoire expose quatre fréquences', () => {
    expect(FANFARE_VICTOIRE).toHaveLength(4);
  });
});
