import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initialiserContexteAudio,
  lireEtatAudio,
  reinitialiserEtatAudio,
  VOLUME_MAITRE,
} from './audio-context-store.js';

describe('audio-context-store', () => {
  beforeEach(() => {
    reinitialiserEtatAudio();
  });

  it('initialise et réinitialise l’état audio', () => {
    const mockCtx = {
      createGain: vi.fn(() => ({
        gain: { value: 0 },
        connect: vi.fn(),
      })),
      destination: {},
    };
    const Ctx = vi.fn(() => mockCtx);
    const buffer = {};
    const creerBuffer = vi.fn(() => buffer);

    const ctx = initialiserContexteAudio(Ctx, creerBuffer);
    expect(ctx).toBe(mockCtx);
    expect(lireEtatAudio().gainMaitre.gain.value).toBe(VOLUME_MAITRE);
    expect(lireEtatAudio().bufferBruit).toBe(buffer);

    reinitialiserEtatAudio();
    expect(lireEtatAudio().ctxAudio).toBeNull();
  });

  it('retourne null sans constructeur AudioContext', () => {
    expect(initialiserContexteAudio(null, vi.fn())).toBeNull();
  });
});
