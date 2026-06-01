import { describe, expect, it } from 'vitest';
import { formaterScoreAffichage, plafonnerScore, SCORE_MAX } from './score-helpers.js';

describe('score-helpers', () => {
  it('borne le score entre 0 et 9999', () => {
    expect(plafonnerScore(-10)).toBe(0);
    expect(plafonnerScore(42)).toBe(42);
    expect(plafonnerScore(SCORE_MAX + 500)).toBe(SCORE_MAX);
    expect(plafonnerScore('abc')).toBe(0);
  });

  it('formate sur 6 chiffres', () => {
    expect(formaterScoreAffichage(200)).toBe('000200');
    expect(formaterScoreAffichage(SCORE_MAX)).toBe('009999');
  });
});
