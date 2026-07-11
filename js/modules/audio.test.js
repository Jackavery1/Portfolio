/* @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function creerMockCtxAudio(surcharge = {}) {
  return {
    state: 'running',
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createOscillator: vi.fn(() => ({
      type: 'square',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
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

describe('audio', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('expose la fanfare victoire standard', async () => {
    const { jouerFanfareVictoire } = await import('./audio.js');
    expect(() => jouerFanfareVictoire()).not.toThrow();
    await vi.runAllTimersAsync();
  });

  it('jouerFanfareVictoire ne lève pas sans AudioContext', async () => {
    const { jouerFanfareVictoire } = await import('./audio.js');
    expect(() => jouerFanfareVictoire()).not.toThrow();
    await vi.runAllTimersAsync();
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
    const ctx = creerMockCtxAudio({
      createOscillator: vi.fn(() => osc),
      createGain: vi.fn(() => gain),
    });

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60, 'square');
    expect(start).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('partage le même AudioContext que musique-audio.js', async () => {
    const ctx = creerMockCtxAudio();
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    const { obtenirContexte } = await import('./musique-audio.js');
    jouerBip(440, 60);
    expect(obtenirContexte()).toBe(ctx);
  });

  it('reprend un contexte suspendu', async () => {
    const ctx = creerMockCtxAudio({ state: 'suspended' });

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    jouerBip(220, 40);
    expect(ctx.resume).toHaveBeenCalled();
  });

  it('utilise webkitAudioContext en secours', async () => {
    const WebkitCtx = vi.fn(() => creerMockCtxAudio());

    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', WebkitCtx);

    const { jouerBip } = await import('./audio.js');
    jouerBip(300, 50);
    expect(WebkitCtx).toHaveBeenCalled();
  });

  it('jouerBip ignore les erreurs Web Audio', async () => {
    const ctx = creerMockCtxAudio({
      createOscillator: vi.fn(() => {
        throw new Error('fail');
      }),
    });
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );
    vi.resetModules();
    const { jouerBip } = await import('./audio.js');
    expect(() => jouerBip(440, 60)).not.toThrow();
  });

  it('jouerBip sort silencieusement si AudioContext indisponible', async () => {
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => {
        throw new Error('AudioContext indisponible');
      })
    );
    vi.stubGlobal('webkitAudioContext', undefined);

    const { jouerBip } = await import('./audio.js');
    expect(() => jouerBip(440, 60)).not.toThrow();
  });

  it('log debug si resume AudioContext échoue en localhost', async () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.stubGlobal('location', { hostname: 'localhost' });

    const ctx = creerMockCtxAudio({
      state: 'suspended',
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      resume: vi.fn().mockRejectedValue(new Error('reprise refusée')),
    });

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60);
    await Promise.resolve();

    expect(debug).toHaveBeenCalledWith('[audio] reprise AudioContext refusée', expect.any(Error));
  });

  it('log debug si Web Audio échoue sur 127.0.0.1', async () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.stubGlobal('location', { hostname: '127.0.0.1' });

    const ctx = creerMockCtxAudio({
      createOscillator: vi.fn(() => {
        throw new Error('osc fail');
      }),
    });

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60);

    expect(debug).toHaveBeenCalledWith('[audio] Web Audio indisponible', expect.any(Error));
  });

  it('jouerFanfareVictoire utilise les délais par défaut', async () => {
    const start = vi.fn();
    const ctx = creerMockCtxAudio({
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start,
        stop: vi.fn(),
      })),
    });

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );

    const { jouerFanfareVictoire } = await import('./audio.js');
    jouerFanfareVictoire();
    await vi.runAllTimersAsync();

    expect(start.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('jouerFanfareVictoire planifie plusieurs bips', async () => {
    const start = vi.fn();
    const ctx = creerMockCtxAudio({
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn().mockReturnThis(),
        start,
        stop: vi.fn(),
      })),
    });
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

  it('jouerSequenceBeeps planifie avec delais explicites', async () => {
    const start = vi.fn();
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() =>
        creerMockCtxAudio({
          createOscillator: vi.fn(() => ({
            type: 'square',
            frequency: { setValueAtTime: vi.fn() },
            connect: vi.fn().mockReturnThis(),
            start,
            stop: vi.fn(),
          })),
        })
      )
    );
    vi.resetModules();

    const { jouerSequenceBeeps } = await import('./audio.js');
    jouerSequenceBeeps([440, 880], { delais: [0, 40], duree: 90, type: 'sine' });
    await vi.runAllTimersAsync();
    expect(start).toHaveBeenCalledTimes(2);
  });

  it('jouerSequenceBeeps utilise delai increment par defaut', async () => {
    const start = vi.fn();
    vi.stubGlobal(
      'AudioContext',
      vi.fn(() =>
        creerMockCtxAudio({
          createOscillator: vi.fn(() => ({
            type: 'square',
            frequency: { setValueAtTime: vi.fn() },
            connect: vi.fn().mockReturnThis(),
            start,
            stop: vi.fn(),
          })),
        })
      )
    );

    const { jouerSequenceBeeps } = await import('./audio.js');
    jouerSequenceBeeps([440, 880, 660]);
    await vi.advanceTimersByTimeAsync(300);
    expect(start.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('jouerBip utilise ctx.destination si le gain maître est absent', async () => {
    const destination = { id: 'dest' };
    const connect = vi.fn().mockReturnThis();
    const ctx = {
      state: 'running',
      currentTime: 0,
      destination,
      createOscillator: vi.fn(() => ({
        type: 'square',
        frequency: { setValueAtTime: vi.fn() },
        connect,
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect,
      })),
      createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(8) })),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    vi.stubGlobal(
      'AudioContext',
      vi.fn(() => ctx)
    );
    vi.resetModules();
    vi.doMock('./musique-audio.js', () => ({
      assurerContexteActif: () => ctx,
      obtenirGainMaitre: () => null,
    }));

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60);
    expect(connect).toHaveBeenCalledWith(destination);
  });
});
