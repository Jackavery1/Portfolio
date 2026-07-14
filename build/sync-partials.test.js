import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { ensureSyncSource } from './ensure-sync.cjs';

const require = createRequire(import.meta.url);
const { PARTIELS } = require('./partials-list.mjs');
const { syncPartials } = require('./sync-partials.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-partials.cjs');

describe('partials sync', () => {
  beforeAll(() => {
    ensureSyncSource();
  });

  it('syncPartials régénère partials.js', () => {
    syncPartials();

    const partialsJs = fs.readFileSync(path.join(rootDir, 'js', 'config', 'partials.js'), 'utf8');
    PARTIELS.forEach(({ id, fichier }) => {
      expect(partialsJs).toContain(`id: '${id}'`);
      expect(partialsJs).toContain(`fichier: '${fichier}'`);
    });
    expect(partialsJs).toContain('Généré par build/sync-partials.cjs');
  });

  it('CLI exécute syncPartials sans erreur', () => {
    const resultat = spawnSync(process.execPath, [scriptPath], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    expect(resultat.status).toBe(0);
  });
});
