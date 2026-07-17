import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  creerCtxAvecOscillateur,
  creerMockCtxAudio,
  stubAudioContext,
} from '../test-fixtures/audio-context-mock.js';

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
    await vi.advanceTimersByTimeAsync(400);
  });

  it('jouerFanfareVictoire ne lève pas sans AudioContext', async () => {
    const { jouerFanfareVictoire } = await import('./audio.js');
    expect(() => jouerFanfareVictoire()).not.toThrow();
    await vi.advanceTimersByTimeAsync(400);
  });

  it('jouerBip utilise Web Audio quand disponible', async () => {
    const start = vi.fn();
    const stop = vi.fn();
    const ctx = creerCtxAvecOscillateur({ start, stop });
    stubAudioContext(ctx);

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60, 'square');
    expect(start).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('partage le même AudioContext que musique-audio.js', async () => {
    const ctx = creerMockCtxAudio();
    stubAudioContext(ctx);

    const { jouerBip } = await import('./audio.js');
    const { obtenirContexte } = await import('./musique-audio.js');
    jouerBip(440, 60);
    expect(obtenirContexte()).toBe(ctx);
  });

  it('reprend un contexte suspendu', async () => {
    const ctx = creerMockCtxAudio({ state: 'suspended' });
    stubAudioContext(ctx);

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
    stubAudioContext(ctx);
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
    const ctx = creerCtxAvecOscillateur({
      surchargeCtx: {
        state: 'suspended',
        resume: vi.fn().mockRejectedValue(new Error('reprise refusée')),
      },
    });
    stubAudioContext(ctx);

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
    stubAudioContext(ctx);

    const { jouerBip } = await import('./audio.js');
    jouerBip(440, 60);

    expect(debug).toHaveBeenCalledWith('[audio] Web Audio indisponible', expect.any(Error));
  });

  it('jouerFanfareVictoire utilise les délais par défaut', async () => {
    const start = vi.fn();
    stubAudioContext(creerCtxAvecOscillateur({ start }));

    const { jouerFanfareVictoire } = await import('./audio.js');
    jouerFanfareVictoire();
    await vi.advanceTimersByTimeAsync(400);

    expect(start.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('jouerFanfareVictoire planifie plusieurs bips', async () => {
    const start = vi.fn();
    stubAudioContext(creerCtxAvecOscillateur({ start }));
    vi.resetModules();

    const { jouerFanfareVictoire } = await import('./audio.js');
    jouerFanfareVictoire({ delais: [0, 10, 20, 30] });
    await vi.advanceTimersByTimeAsync(40);
    expect(start.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('jouerSequenceBeeps planifie avec delais explicites', async () => {
    const start = vi.fn();
    stubAudioContext(creerCtxAvecOscillateur({ start }));
    vi.resetModules();

    const { jouerSequenceBeeps } = await import('./audio.js');
    jouerSequenceBeeps([440, 880], { delais: [0, 40], duree: 90, type: 'sine' });
    await vi.advanceTimersByTimeAsync(50);
    expect(start).toHaveBeenCalledTimes(2);
  });

  it('jouerSequenceBeeps utilise delai increment par defaut', async () => {
    const start = vi.fn();
    stubAudioContext(creerCtxAvecOscillateur({ start }));

    const { jouerSequenceBeeps } = await import('./audio.js');
    jouerSequenceBeeps([440, 880, 660]);
    await vi.advanceTimersByTimeAsync(300);
    expect(start.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('jouerBip utilise ctx.destination si le gain maître est absent', async () => {
    const destination = { id: 'dest' };
    const connect = vi.fn().mockReturnThis();
    const ctx = creerMockCtxAudio({
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
    });

    stubAudioContext(ctx);
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
