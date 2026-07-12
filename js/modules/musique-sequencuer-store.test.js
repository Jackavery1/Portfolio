import { describe, expect, it } from 'vitest';
import {
  lireEtatSequencuer,
  reinitialiserEtatSequencuerStore,
} from './musique-sequencuer-store.js';

describe('musique-sequencuer-store', () => {
  it('expose l’état mutable du séquenceur', () => {
    const etat = lireEtatSequencuer();
    expect(etat.themeCourant).toBe('HOME');
    expect(etat.actif).toBe(false);
    etat.actif = true;
    etat.themeCourant = 'WORK';
    expect(lireEtatSequencuer().actif).toBe(true);
    expect(lireEtatSequencuer().themeCourant).toBe('WORK');
  });

  it('reinitialiserEtatSequencuerStore remet les valeurs par défaut', () => {
    const etat = lireEtatSequencuer();
    etat.actif = true;
    etat.themeCourant = 'DOJO';
    etat.themes = { HOME: {} };
    etat.pasCourant = 12;
    reinitialiserEtatSequencuerStore();
    expect(etat.actif).toBe(false);
    expect(etat.themeCourant).toBe('HOME');
    expect(etat.themes).toBeNull();
    expect(etat.pasCourant).toBe(0);
  });
});
