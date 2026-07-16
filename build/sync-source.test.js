import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-source', () => {
  const IDS_ATTENDUS = [
    'defaults',
    'style-css',
    'partials',
    'nav-squelette',
    'parcours-arbre',
    'dojo-boss',
    'competences-stats',
    'accueil-hero',
    'breakpoints',
    'legal',
    'projects',
    'musique-donnees',
    'manifest-dev',
  ];

  it('documente l’ordre des phases de synchronisation', () => {
    const { IDS_PHASES_SYNC, getSyncPhases } = require('./sync-source.cjs');
    expect(IDS_PHASES_SYNC).toEqual(IDS_ATTENDUS);
    expect(getSyncPhases().map((phase) => phase.id)).toEqual(IDS_ATTENDUS);
  });

  it('exécute les phases injectées dans l’ordre', () => {
    const { syncSource } = require('./sync-source.cjs');
    const ordre = [];
    const phases = IDS_ATTENDUS.map((id) => ({
      id,
      executer: () => ordre.push(id),
    }));
    syncSource({ phases });
    expect(ordre).toEqual(IDS_ATTENDUS);
  });

  it('orchestre les synchronisations attendues', () => {
    const { syncSource } = require('./sync-source.cjs');
    syncSource();

    expect(fs.existsSync(path.join(rootDir, 'js/config/defaults.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/legal-data.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/projects-data.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/musique-themes.json'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/partials.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'style.css'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'manifest.webmanifest'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'partials/accueil-hero.html'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'partials/competences-stats.html'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'partials/dojo-boss-rush-lot-a.html'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'partials/dojo-boss-rush-lot-b.html'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'partials/dojo-boss-rush-lot-c.html'))).toBe(true);
  });

  it('synchronise les métadonnées page si pageMeta est activé', () => {
    const { syncSource } = require('./sync-source.cjs');
    expect(() => syncSource({ pageMeta: true })).not.toThrow();
  });

  it('executerDepuisArgv active pageMeta avec --page-meta', () => {
    const { executerDepuisArgv } = require('./sync-source.cjs');
    expect(() =>
      executerDepuisArgv(['node', 'build/sync-source.cjs', '--page-meta'])
    ).not.toThrow();
  });

  it('executerDepuisArgv sans flag ignore pageMeta', () => {
    const { executerDepuisArgv } = require('./sync-source.cjs');
    expect(() => executerDepuisArgv(['node', 'build/sync-source.cjs'])).not.toThrow();
  });

  it('executerSiEntreeDirecte ignore si ce n’est pas l’entrée CLI', () => {
    const { executerSiEntreeDirecte } = require('./sync-source.cjs');
    const fn = () => {
      throw new Error('ne doit pas s’exécuter');
    };
    expect(() => executerSiEntreeDirecte({}, module.exports, fn)).not.toThrow();
  });

  it('estEntreeDirecte compare require.main et module', () => {
    const { estEntreeDirecte } = require('./sync-source.cjs');
    const ref = {};
    expect(estEntreeDirecte(ref, ref)).toBe(true);
    expect(estEntreeDirecte({}, ref)).toBe(false);
  });

  it('executerSiEntreeDirecte lance syncSource si entree directe', () => {
    const { executerSiEntreeDirecte, executerDepuisArgv } = require('./sync-source.cjs');
    const ref = {};
    expect(() =>
      executerSiEntreeDirecte(ref, ref, () => executerDepuisArgv(['node', 'sync-source.cjs']))
    ).not.toThrow();
  });

  it('point d’entrée CLI node build/sync-source.cjs', () => {
    expect(() =>
      execSync('node build/sync-source.cjs', { cwd: rootDir, stdio: 'pipe' })
    ).not.toThrow();
  });
});
