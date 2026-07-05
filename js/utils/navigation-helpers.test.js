import { describe, expect, it } from 'vitest';
import { indexDansOrdreNavigation, libellerPageNavigation } from './navigation-helpers.js';
import { NAVIGATION } from '../config/navigation.js';

describe('navigation-helpers', () => {
  it('retourne l’index dans l’ordre du menu', () => {
    expect(indexDansOrdreNavigation('/Portfolio/projets.html', NAVIGATION.ORDRE)).toBe(1);
    expect(indexDansOrdreNavigation('/Portfolio/projets', NAVIGATION.ORDRE)).toBe(1);
    expect(indexDansOrdreNavigation('/Portfolio/', NAVIGATION.ORDRE)).toBe(0);
  });

  it('retourne -1 hors menu principal', () => {
    expect(indexDansOrdreNavigation('/Portfolio/dojo.html', NAVIGATION.ORDRE)).toBe(-1);
  });

  it('libelle les pages du menu en français', () => {
    expect(libellerPageNavigation('projets.html')).toBe('Projets');
    expect(libellerPageNavigation('contact.html')).toBe('Contact');
  });
});
