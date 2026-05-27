import { describe, expect, it } from 'vitest';
import { decodeBase64Utf8, formatTelephoneFr } from './pii.js';

describe('decodeBase64Utf8', () => {
  it('décode une chaîne base64 valide', () => {
    expect(decodeBase64Utf8('dGVzdA==')).toBe('test');
  });

  it('retourne chaîne vide si base64 invalide', () => {
    expect(decodeBase64Utf8('!!!')).toBe('');
  });
});

describe('formatTelephoneFr', () => {
  it('formate un numéro à partir de parts', () => {
    const { affichage, tel } = formatTelephoneFr([6, 12, 34, 56, 78]);
    expect(affichage).toBe('06 12 34 56 78');
    expect(tel).toBe('+33612345678');
  });

  it('retourne vide si parts insuffisantes', () => {
    expect(formatTelephoneFr([6])).toEqual({ affichage: '', tel: '' });
  });
});
