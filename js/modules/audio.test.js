import { describe, expect, it } from 'vitest';
import { FANFARE_VICTOIRE, jouerFanfareVictoire } from '../modules/audio.js';

describe('audio', () => {
  it('expose la fanfare victoire standard', () => {
    expect(FANFARE_VICTOIRE).toEqual([523, 659, 784, 1047]);
  });

  it('jouerFanfareVictoire ne lève pas sans AudioContext', () => {
    expect(() => jouerFanfareVictoire()).not.toThrow();
  });
});
