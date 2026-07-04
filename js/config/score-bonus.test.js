import { describe, expect, it } from 'vitest';
import { SCORE_BONUS } from './score-bonus.js';

describe('SCORE_BONUS', () => {
  it('expose les bonus arcade attendus', () => {
    expect(SCORE_BONUS.PAGE).toBe(200);
    expect(SCORE_BONUS.PROJET).toBe(600);
    expect(SCORE_BONUS.DOJO_BOSS).toBe(300);
    expect(SCORE_BONUS.CONTACT).toBe(500);
    expect(SCORE_BONUS.GITHUB).toBe(500);
  });
});
