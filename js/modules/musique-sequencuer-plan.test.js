import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./musique-audio.js', () => ({
  obtenirGainMaitre: vi.fn(() => ({ id: 'gain' })),
  jouerHat: vi.fn(),
  jouerKick: vi.fn(),
  jouerNappe: vi.fn(),
  jouerPulse: vi.fn(),
  jouerSnare: vi.fn(),
  jouerTriangle: vi.fn(),
}));

import { jouerHat, jouerKick, jouerNappe, jouerPulse, jouerSnare, jouerTriangle } from './musique-audio.js';
import { dureePas, planifierPas } from './musique-sequencuer-plan.js';
import {
  definirCatalogueThemesSequencuer,
  definirThemeCourantSequencuer,
  reinitialiserEtatSequencuerStore,
} from './musique-sequencuer-store.js';

function grilleVide(valeur = 0) {
  return Array.from({ length: 8 }, () => Array.from({ length: 16 }, () => valeur));
}

function grilleAuPas(valeur, mesure = 0, pas = 0) {
  const grille = grilleVide(0);
  grille[mesure][pas] = valeur;
  return grille;
}

describe('musique-sequencuer-plan', () => {
  beforeEach(() => {
    reinitialiserEtatSequencuerStore();
    vi.clearAllMocks();
  });

  it('dureePas sans catalogue utilise le BPM par défaut', () => {
    expect(dureePas()).toBe(60 / 128 / 4);
  });

  it('dureePas thème inconnu sans HOME utilise le BPM par défaut', () => {
    definirCatalogueThemesSequencuer({}, null, null);
    definirThemeCourantSequencuer('INCONNU');
    expect(dureePas()).toBe(60 / 128 / 4);
  });

  it('dureePas retombe sur HOME si le thème courant est absent', () => {
    definirCatalogueThemesSequencuer({ HOME: { bpm: 120, facteurTempo: 1 } }, null, null);
    definirThemeCourantSequencuer('ABSENT');
    expect(dureePas()).toBeCloseTo(60 / 120 / 4);
  });

  it('planifierPas no-op si aucun thème disponible', () => {
    planifierPas(0, 0);
    expect(jouerKick).not.toHaveBeenCalled();
    expect(jouerHat).not.toHaveBeenCalled();
  });

  it('ignore un motif non-tableau et une nappe falsy', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          basse: { pasUnTableau: true },
          nappe: [0, 0, 0, 0, 0, 0, 0, 0],
          kick: grilleAuPas(1),
        },
      },
      null,
      null
    );
    planifierPas(0, 0);
    expect(jouerTriangle).not.toHaveBeenCalled();
    expect(jouerNappe).not.toHaveBeenCalled();
    expect(jouerKick).toHaveBeenCalled();
  });

  it('applique le gain hat fort STATS (0,16) et le gain défaut hors map', () => {
    const hatFort = grilleAuPas(2);
    const hatNormal = grilleAuPas(1);
    definirCatalogueThemesSequencuer(
      {
        STATS: {
          bpm: 128,
          facteurTempo: 1,
          hat: hatFort,
        },
        AUTRE: {
          bpm: 128,
          facteurTempo: 1,
          hat: hatNormal,
        },
      },
      null,
      null
    );

    definirThemeCourantSequencuer('STATS');
    planifierPas(0, 0);
    expect(jouerHat).toHaveBeenCalledWith(0, expect.anything(), 0.16);

    jouerHat.mockClear();
    definirThemeCourantSequencuer('AUTRE');
    planifierPas(0, 0);
    expect(jouerHat).toHaveBeenCalledWith(0, expect.anything(), 0.04);
  });

  it('planifie mélodie et arpège double', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          vibrato: true,
          doubleArpege: true,
          melodie: grilleAuPas(440),
          arpege: grilleAuPas(220),
        },
      },
      null,
      null
    );
    planifierPas(0, 0);
    expect(jouerPulse).toHaveBeenCalled();
    expect(jouerPulse.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('planifie un arpège simple avec décalage (sans doubleArpege)', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          arpege: grilleAuPas(330),
        },
      },
      null,
      null
    );
    planifierPas(0, 0);
    expect(jouerPulse).toHaveBeenCalledTimes(1);
    const temps = jouerPulse.mock.calls[0][1];
    expect(temps).toBeGreaterThan(0);
  });

  it('joue la nappe au premier pas de mesure', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          nappe: [110, 0, 0, 0, 0, 0, 0, 0],
        },
      },
      null,
      null
    );
    planifierPas(0, 1.5);
    expect(jouerNappe).toHaveBeenCalledWith(110, 1.5, expect.any(Number), expect.anything());
  });

  it('applique le gain hat fort hors STATS (0,18)', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          hat: grilleAuPas(2),
        },
      },
      null,
      null
    );
    planifierPas(0, 0);
    expect(jouerHat).toHaveBeenCalledWith(0, expect.anything(), 0.18);
  });

  it('joue snare et basse quand les cellules sont actives', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          snare: grilleAuPas(1),
          basse: grilleAuPas(55),
        },
      },
      null,
      null
    );
    planifierPas(0, 0);
    expect(jouerSnare).toHaveBeenCalled();
    expect(jouerTriangle).toHaveBeenCalledWith(55, 0, expect.any(Number), expect.anything());
  });

  it('ignore mélodie/arpège à 0 et ligne de motif absente', () => {
    const melodie = grilleVide(0);
    melodie[0] = null;
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          melodie,
          arpege: grilleAuPas(0),
          doubleArpege: true,
        },
      },
      null,
      null
    );
    planifierPas(0, 0);
    expect(jouerPulse).not.toHaveBeenCalled();
  });

  it('n’ajoute pas le 2ᵉ pulse d’arpège sur pas impair', () => {
    definirCatalogueThemesSequencuer(
      {
        HOME: {
          bpm: 128,
          facteurTempo: 1,
          doubleArpege: true,
          arpege: grilleAuPas(220, 0, 1),
        },
      },
      null,
      null
    );
    planifierPas(1, 0);
    expect(jouerPulse).toHaveBeenCalledTimes(1);
  });
});
