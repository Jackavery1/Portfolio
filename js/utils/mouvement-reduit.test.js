import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefereMouvementReduit } from './mouvement-reduit.js';

describe('mouvement-reduit', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne false par défaut', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(prefereMouvementReduit()).toBe(false);
  });

  it('retourne true sous prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(prefereMouvementReduit()).toBe(true);
  });
});
