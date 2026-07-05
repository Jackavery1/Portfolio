import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { ensureSyncSource } = require('./ensure-sync.cjs');

const FICHIER_GENERE = path.join(rootDir, 'partials', 'dojo-boss-rush.html');

describe('ensure-sync', () => {
  it('ne lève pas d’erreur quand les fichiers générés existent', () => {
    expect(() => ensureSyncSource()).not.toThrow();
    expect(fs.existsSync(FICHIER_GENERE)).toBe(true);
  });

  it('régénère les fichiers manquants via syncSource', () => {
    const contenu = fs.readFileSync(FICHIER_GENERE, 'utf8');
    fs.rmSync(FICHIER_GENERE);

    try {
      ensureSyncSource();
      expect(fs.existsSync(FICHIER_GENERE)).toBe(true);
      expect(fs.readFileSync(FICHIER_GENERE, 'utf8')).toBe(contenu);
    } finally {
      if (!fs.existsSync(FICHIER_GENERE)) {
        fs.writeFileSync(FICHIER_GENERE, contenu, 'utf8');
      }
    }
  });
});
