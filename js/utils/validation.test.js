import { describe, expect, it } from 'vitest';
import {
  cleDansScriptRecaptchaV3,
  estEmailValide,
  nettoyerChamp,
} from './validation.js';

describe('nettoyerChamp', () => {
  it('trim et tronque à maxLen', () => {
    expect(nettoyerChamp('  abc  ', 10)).toBe('abc');
    expect(nettoyerChamp('abcdefghij', 5)).toBe('abcde');
  });

  it('retire les caractères de contrôle', () => {
    expect(nettoyerChamp('a\u0000b', 10)).toBe('ab');
  });
});

describe('estEmailValide', () => {
  it('accepte un email valide', () => {
    expect(estEmailValide('test@example.com', 254)).toBe(true);
  });

  it('rejette email vide ou invalide', () => {
    expect(estEmailValide('', 254)).toBe(false);
    expect(estEmailValide('pas-un-email', 254)).toBe(false);
    expect(estEmailValide('a@b.c', 254)).toBe(false);
  });

  it('respecte maxLen', () => {
    const long = `${'a'.repeat(250)}@example.com`;
    expect(estEmailValide(long, 20)).toBe(false);
  });
});

describe('cleDansScriptRecaptchaV3', () => {
  it('extrait render= depuis src', () => {
    const script = {
      src: 'https://www.google.com/recaptcha/api.js?render=6LcTEST',
    };
    expect(cleDansScriptRecaptchaV3(script)).toBe('6LcTEST');
  });

  it('retourne null si pas de src', () => {
    expect(cleDansScriptRecaptchaV3(null)).toBe(null);
    expect(cleDansScriptRecaptchaV3({})).toBe(null);
  });
});
