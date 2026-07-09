import fs from 'node:fs';
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
});
