import { describe, expect, it } from 'vitest';
import { estPageDense } from './pages-denses.js';

describe('pages-denses', () => {
  it('identifie les sections à contenu lourd', () => {
    expect(estPageDense('competences')).toBe(true);
    expect(estPageDense('parcours')).toBe(true);
    expect(estPageDense('dojo')).toBe(true);
    expect(estPageDense('accueil')).toBe(false);
  });
});
