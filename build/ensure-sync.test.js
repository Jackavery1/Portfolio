import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('ensure-sync', () => {
  const { ensureSyncSource } = loadBuild('ensure-sync.cjs');

  it('ne lève pas d’erreur quand les fichiers générés existent', () => {
    loadBuild('sync-source.cjs').syncSource();
    expect(() => ensureSyncSource()).not.toThrow();
    expect(fs.existsSync(path.join(rootDir, 'partials', 'dojo-boss-rush-lot-a.html'))).toBe(true);
  });

  it('régénère via syncSource si un artefact généré manque', () => {
    const syncModule = loadBuild('sync-source.cjs');
    const existsReel = fs.existsSync.bind(fs);
    const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation((fichier) => {
      if (String(fichier).includes('dojo-boss-rush-lot-a.html')) return false;
      return existsReel(fichier);
    });
    const syncSpy = vi.spyOn(syncModule, 'syncSource').mockImplementation(() => {});

    try {
      ensureSyncSource();
      expect(syncSpy).toHaveBeenCalled();
    } finally {
      existsSpy.mockRestore();
      syncSpy.mockRestore();
      syncModule.syncSource();
    }
  });
});
