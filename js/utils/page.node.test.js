import { describe, expect, it } from 'vitest';
import { obtenirFichierPageCourante } from './page.js';

describe('utilitaires page (sans window)', () => {
  it('utilise une chaîne vide si window est absent', () => {
    const original = globalThis.window;
    // @ts-expect-error test environnement node pur
    delete globalThis.window;
    expect(obtenirFichierPageCourante()).toBe('index.html');
    globalThis.window = original;
  });
});
