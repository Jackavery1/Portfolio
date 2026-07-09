import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-source', () => {
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
    expect(fs.existsSync(path.join(rootDir, 'partials/dojo-boss-rush.html'))).toBe(true);
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

  it('point d’entrée CLI node build/sync-source.cjs', () => {
    expect(() =>
      execSync('node build/sync-source.cjs', { cwd: rootDir, stdio: 'pipe' })
    ).not.toThrow();
  });
});
