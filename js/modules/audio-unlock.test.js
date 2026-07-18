import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lireEtatAudio, reinitialiserEtatAudio } from './audio-context-store.js';
import { deverrouillerAudioAuGeste } from './audio-unlock.js';

describe('audio-unlock', () => {
  beforeEach(() => {
    reinitialiserEtatAudio();
  });

  afterEach(() => {
    reinitialiserEtatAudio();
    vi.unstubAllGlobals();
  });

  it('crée et reprend un AudioContext pendant le geste', () => {
    const resume = vi.fn().mockResolvedValue(undefined);
    const createGain = vi.fn(() => ({
      gain: { value: 0 },
      connect: vi.fn(),
    }));
    const createBuffer = vi.fn(() => ({
      getChannelData: () => new Float32Array(8),
    }));
    function FakeCtx() {
      this.state = 'suspended';
      this.sampleRate = 8000;
      this.destination = {};
      this.resume = resume;
      this.createGain = createGain;
      this.createBuffer = createBuffer;
    }
    vi.stubGlobal('AudioContext', FakeCtx);

    const ctx = deverrouillerAudioAuGeste();
    expect(ctx).toBe(lireEtatAudio().ctxAudio);
    expect(resume).toHaveBeenCalled();
  });

  it('réutilise un contexte déjà créé', () => {
    const resume = vi.fn().mockResolvedValue(undefined);
    const existant = { state: 'suspended', resume };
    lireEtatAudio().ctxAudio = existant;

    expect(deverrouillerAudioAuGeste()).toBe(existant);
    expect(resume).toHaveBeenCalled();
  });

  it('retourne null sans AudioContext', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);
    expect(deverrouillerAudioAuGeste()).toBeNull();
  });
});
