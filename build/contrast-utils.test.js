import { describe, expect, it } from 'vitest';
import { ratioContrasteHex } from './contrast-utils.mjs';

describe('contrast-utils', () => {
  it('calcule un ratio AA pour texte fort sur fond page', () => {
    expect(ratioContrasteHex('#d0ddff', '#03040f')).toBeGreaterThanOrEqual(4.5);
  });

  it('échoue AA pour un gris trop clair sur fond sombre', () => {
    expect(ratioContrasteHex('#444444', '#03040f')).toBeLessThan(4.5);
  });
});
