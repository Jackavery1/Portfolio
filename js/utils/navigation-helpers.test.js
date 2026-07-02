import { describe, expect, it } from 'vitest';
import { indexDansOrdreNavigation } from './navigation-helpers.js';

const ORDRE = ['index.html', 'projets.html', 'competences.html', 'parcours.html', 'contact.html'];

describe('navigation-helpers', () => {
  it('retourne l’index dans l’ordre du menu', () => {
    expect(indexDansOrdreNavigation('/Portfolio/projets.html', ORDRE)).toBe(1);
    expect(indexDansOrdreNavigation('/Portfolio/', ORDRE)).toBe(0);
  });

  it('retourne -1 hors menu principal', () => {
    expect(indexDansOrdreNavigation('/Portfolio/dojo.html', ORDRE)).toBe(-1);
  });
});
