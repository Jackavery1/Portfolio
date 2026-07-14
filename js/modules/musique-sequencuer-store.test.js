import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  lireEtatSequencuer,
  reinitialiserEtatSequencuerStore,
} from './musique-sequencuer-store.js';

describe('musique-sequencuer-store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reinitialiserEtatSequencuerStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
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

  it('reinitialiserEtatSequencuerStore annule le minuteur planificateur actif', () => {
    const etat = lireEtatSequencuer();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const minuteur = setTimeout(() => {}, 60_000);
    etat.minuteurPlanificateur = minuteur;

    reinitialiserEtatSequencuerStore();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(minuteur);
    expect(etat.minuteurPlanificateur).toBeNull();
  });
});
