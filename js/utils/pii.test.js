import { describe, expect, it } from 'vitest';
import { decoderBase64Utf8, formaterTelephoneFr } from './pii.js';

describe('decoderBase64Utf8', () => {
  it('décode une chaîne base64 valide', () => {
    expect(decoderBase64Utf8('dGVzdA==')).toBe('test');
  });

  it('retourne chaîne vide si base64 invalide', () => {
    expect(decoderBase64Utf8('!!!')).toBe('');
  });
});

describe('formaterTelephoneFr', () => {
  it('formate un numéro à partir de parts', () => {
    const { affichage, tel } = formaterTelephoneFr([6, 12, 34, 56, 78]);
    expect(affichage).toBe('06 12 34 56 78');
    expect(tel).toBe('+33612345678');
  });

  it('retourne vide si parts insuffisantes', () => {
    expect(formaterTelephoneFr([6])).toEqual({ affichage: '', tel: '' });
  });
});
