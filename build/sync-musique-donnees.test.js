import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { syncMusiqueDonnees, compilerThemes } = require('./sync-musique-donnees.cjs');

describe('sync-musique-donnees', () => {
  it('compile les thèmes depuis musique-donnees.json', () => {
    const jsonPath = path.join(rootDir, 'js', 'config', 'musique-donnees.json');
    const donnees = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const compiled = compilerThemes(donnees);

    expect(compiled.THEMES.HOME.bpm).toBe(128);
    expect(compiled.THEMES.HOME.melodie).toHaveLength(8);
    expect(compiled.THEMES.HOME.melodie[0]).toHaveLength(16);
    expect(compiled.THEMES.STATS.nappe).toHaveLength(8);
    expect(compiled.THEME_PAR_SECTION.dojo).toBe('DOJO');
  });

  it('génère js/config/musique-themes.json', () => {
    syncMusiqueDonnees(rootDir);
    const outPath = path.join(rootDir, 'js', 'config', 'musique-themes.json');
    expect(fs.existsSync(outPath)).toBe(true);
    const donnees = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    expect(donnees.THEMES.HOME).toBeDefined();
    expect(donnees.THEME_PAR_SECTION.dojo).toBe('DOJO');
    expect(fs.existsSync(path.join(rootDir, 'js', 'config', 'musique-themes.js'))).toBe(false);
  });

  it('accepte fréquences numériques et ignore pistes absentes', () => {
    const compiled = compilerThemes({
      gamme: { C4: 261.63 },
      gammePhrygienne: {},
      mesures: {},
      motifs: {
        piste: { type: 'notes', notes: [110, 'C4', null] },
      },
      themes: {
        TEST: { bpm: 120, basse: 'piste' },
      },
      themeParSection: {},
      themeParFichier: {},
    });
    expect(compiled.THEMES.TEST.basse).toEqual([110, 261.63, 0]);
    expect(compiled.THEMES.TEST.melodie).toBeNull();
  });

  it('rejette une note ou un motif inconnu', () => {
    expect(() =>
      compilerThemes({
        gamme: {},
        gammePhrygienne: {},
        mesures: {},
        motifs: { piste: { type: 'notes', notes: ['Z9'] } },
        themes: { X: { bpm: 100, basse: 'piste' } },
        themeParSection: {},
        themeParFichier: {},
      })
    ).toThrow(/Note inconnue/);

    expect(() =>
      compilerThemes({
        gamme: {},
        gammePhrygienne: {},
        mesures: {},
        motifs: { piste: { type: 'inconnu' } },
        themes: { X: { bpm: 100, basse: 'piste' } },
        themeParSection: {},
        themeParFichier: {},
      })
    ).toThrow(/Motif inconnu/);
  });

  it('lève une erreur si la source JSON est absente', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'musique-tmp-'));
    expect(() => syncMusiqueDonnees(tmp)).toThrow(/Source manquante/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
