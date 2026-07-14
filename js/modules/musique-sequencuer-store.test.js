import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  definirActifSequencuer,
  definirMinuteurPlanificateur,
  definirThemeCourantSequencuer,
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

  it('expose un instantané lecture seule du séquenceur', () => {
    const etat = lireEtatSequencuer();
    expect(etat.themeCourant).toBe('HOME');
    expect(etat.actif).toBe(false);
    etat.actif = true;
    etat.themeCourant = 'WORK';
    expect(lireEtatSequencuer().actif).toBe(false);
    expect(lireEtatSequencuer().themeCourant).toBe('HOME');
  });

  it('mutations via setters dédiés', () => {
    definirActifSequencuer(true);
    definirThemeCourantSequencuer('WORK');
    expect(lireEtatSequencuer().actif).toBe(true);
    expect(lireEtatSequencuer().themeCourant).toBe('WORK');
  });

  it('reinitialiserEtatSequencuerStore remet les valeurs par défaut', () => {
    definirActifSequencuer(true);
    definirThemeCourantSequencuer('DOJO');
    reinitialiserEtatSequencuerStore();
    expect(lireEtatSequencuer().actif).toBe(false);
    expect(lireEtatSequencuer().themeCourant).toBe('HOME');
    expect(lireEtatSequencuer().themes).toBeNull();
    expect(lireEtatSequencuer().pasCourant).toBe(0);
  });

  it('reinitialiserEtatSequencuerStore annule le minuteur planificateur actif', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const minuteur = setTimeout(() => {}, 60_000);
    definirMinuteurPlanificateur(minuteur);

    reinitialiserEtatSequencuerStore();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(minuteur);
    expect(lireEtatSequencuer().minuteurPlanificateur).toBeNull();
  });
});
