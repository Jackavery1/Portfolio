/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ligneRiche = Array.from({ length: 16 }, (_, pas) => {
  if (pas === 0) return 440;
  if (pas === 1) return 2;
  if (pas === 2) return 330;
  return 0;
});
const motifActif = Array.from({ length: 8 }, () => [...ligneRiche]);

const themesRiches = {
  HOME: {
    bpm: 128,
    facteurTempo: 1,
    basse: motifActif,
    melodie: motifActif,
    arpege: motifActif,
    kick: motifActif,
    snare: motifActif,
    hat: motifActif,
    nappe: [440, 0, 0, 0, 0, 0, 0, 0],
    vibrato: true,
    doubleArpege: true,
  },
  STATS: {
    bpm: 128,
    facteurTempo: 1,
    basse: motifActif,
    hat: Array.from({ length: 8 }, () =>
      Array.from({ length: 16 }, (_, pas) => (pas === 0 ? 1 : 0))
    ),
  },
};

const donneesThemes = {
  THEMES: themesRiches,
  THEME_PAR_SECTION: {
    accueil: 'HOME',
    projets: 'WORK',
    competences: 'STATS',
    parcours: 'STORY',
    dojo: 'DOJO',
    contact: 'HOME',
    mentions: 'HOME',
  },
  THEME_PAR_FICHIER: {
    'index.html': 'HOME',
    'projets.html': 'WORK',
    'competences.html': 'STATS',
    'parcours.html': 'STORY',
    'dojo.html': 'DOJO',
    'contact.html': 'HOME',
    'mentions-legales.html': 'HOME',
  },
};

vi.mock('./musique-audio.js', () => ({
  obtenirContexte: vi.fn(() => ({
    currentTime: 0,
    createOscillator: vi.fn(),
    createGain: vi.fn(),
  })),
  obtenirGainMaitre: vi.fn(() => ({})),
  jouerHat: vi.fn(),
  jouerKick: vi.fn(),
  jouerNappe: vi.fn(),
  jouerPulse: vi.fn(),
  jouerSnare: vi.fn(),
  jouerTriangle: vi.fn(),
}));

describe('musique-sequencuer', () => {
  let sequencuer;
  let audio;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve(donneesThemes),
      })
    );
    audio = await import('./musique-audio.js');
    sequencuer = await import('./musique-sequencuer.js');
    sequencuer.reinitialiserEtatSequencuer();
    sequencuer.definirActif(false);
    sequencuer.arreterSequencuer();
  });

  it('charge les thèmes compilés', async () => {
    const themes = await sequencuer.assurerThemes();
    expect(themes.HOME.bpm).toBe(128);
  });

  it('résout le thème depuis section ou fichier', async () => {
    await sequencuer.assurerThemes();
    expect(sequencuer.resoudreThemePage('projets', 'index.html')).toBe('WORK');
    expect(sequencuer.resoudreThemePage('', 'dojo.html')).toBe('DOJO');
    expect(sequencuer.resoudreThemePage('', 'inconnu.html')).toBe('HOME');
  });

  it('planifie les pistes d’un thème riche', async () => {
    await sequencuer.assurerThemes();
    sequencuer.definirActif(true);
    sequencuer.definirThemeCourant('HOME');
    sequencuer.demarrerSequencuer();
    expect(audio.jouerNappe).toHaveBeenCalled();
    expect(audio.jouerTriangle).toHaveBeenCalled();
    expect(audio.jouerPulse).toHaveBeenCalled();
    expect(audio.jouerKick).toHaveBeenCalled();
    expect(audio.jouerSnare).toHaveBeenCalled();
    expect(audio.jouerHat).toHaveBeenCalled();
    sequencuer.arreterSequencuer();
  });

  it('applique le gain hat spécifique STATS', async () => {
    await sequencuer.assurerThemes();
    sequencuer.definirActif(true);
    sequencuer.definirThemeCourant('STATS');
    sequencuer.demarrerSequencuer();
    expect(audio.jouerHat).toHaveBeenCalled();
    sequencuer.arreterSequencuer();
  });

  it('definirTheme ignore les clés inconnues', async () => {
    await sequencuer.assurerThemes();
    sequencuer.definirThemeCourant('HOME');
    sequencuer.definirTheme('INCONNU');
    expect(sequencuer.lireThemeCourant()).toBe('HOME');
    sequencuer.definirTheme('STATS');
    expect(sequencuer.lireThemeCourant()).toBe('STATS');
  });

  it('ne démarre pas sans contexte audio', async () => {
    audio.obtenirContexte.mockReturnValueOnce(null);
    sequencuer.demarrerSequencuer();
    expect(sequencuer.estMusiqueActive()).toBe(false);
  });

  it('applique le gain hat fort (valeur 2)', async () => {
    const hatFort = Array.from({ length: 8 }, () =>
      Array.from({ length: 16 }, (_, pas) => (pas === 0 ? 2 : 0))
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            THEMES: {
              ...themesRiches,
              LOUD: { ...themesRiches.STATS, hat: hatFort },
            },
          }),
      })
    );
    vi.resetModules();
    audio = await import('./musique-audio.js');
    sequencuer = await import('./musique-sequencuer.js');
    await sequencuer.assurerThemes();
    sequencuer.definirActif(true);
    sequencuer.definirThemeCourant('LOUD');
    sequencuer.demarrerSequencuer();
    expect(audio.jouerHat).toHaveBeenCalledWith(expect.any(Number), expect.anything(), 0.18);
    sequencuer.arreterSequencuer();
  });

  it('ignore la planification quand le séquenceur est inactif', async () => {
    await sequencuer.assurerThemes();
    audio.jouerKick.mockClear();
    sequencuer.definirActif(false);
    sequencuer.definirThemeCourant('HOME');
    sequencuer.demarrerSequencuer();
    expect(audio.jouerKick).not.toHaveBeenCalled();
    sequencuer.arreterSequencuer();
  });

  it('tolère les grilles absentes ou invalides', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            THEMES: {
              VIDE: { bpm: 128, facteurTempo: 1, basse: null, melodie: [], kick: [[1]] },
            },
          }),
      })
    );
    vi.resetModules();
    audio = await import('./musique-audio.js');
    sequencuer = await import('./musique-sequencuer.js');
    await sequencuer.assurerThemes();
    sequencuer.definirActif(true);
    sequencuer.definirThemeCourant('VIDE');
    sequencuer.demarrerSequencuer();
    expect(audio.jouerKick).toHaveBeenCalled();
    sequencuer.arreterSequencuer();
  });

  it('résout le thème depuis la section seule', async () => {
    await sequencuer.assurerThemes();
    expect(sequencuer.resoudreThemePage('competences', 'inconnu.html')).toBe('STATS');
  });

  it('planifie un arpège simple sans doubleArpege', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            THEMES: {
              SIMPLE: {
                bpm: 128,
                facteurTempo: 1,
                arpege: motifActif,
                doubleArpege: false,
              },
            },
          }),
      })
    );
    vi.resetModules();
    audio = await import('./musique-audio.js');
    sequencuer = await import('./musique-sequencuer.js');
    await sequencuer.assurerThemes();
    sequencuer.definirActif(true);
    sequencuer.definirThemeCourant('SIMPLE');
    audio.jouerPulse.mockClear();
    sequencuer.demarrerSequencuer();
    expect(audio.jouerPulse).toHaveBeenCalled();
    sequencuer.arreterSequencuer();
  });

  it('reinitialiserEtatSequencuer remet l’état module à zéro', async () => {
    await sequencuer.assurerThemes();
    sequencuer.definirActif(true);
    sequencuer.definirThemeCourant('STATS');
    sequencuer.reinitialiserEtatSequencuer();
    expect(sequencuer.estMusiqueActive()).toBe(false);
    expect(sequencuer.lireThemeCourant()).toBe('HOME');
    await expect(sequencuer.assurerThemes()).resolves.toEqual(themesRiches);
  });

  it('arreterSequencuer est sans effet si le minuteur est absent', () => {
    expect(() => sequencuer.arreterSequencuer()).not.toThrow();
  });
});
