import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-dojo-boss', () => {
  const { syncDojoBoss, FRAGMENTS_BOSS, LOTS, FICHIER_LEGACY } = loadBuild('sync-dojo-boss.cjs');

  it('génère trois lots au lieu du partial monolithique', () => {
    syncDojoBoss(rootDir);

    LOTS.forEach((lot) => {
      const fichier = path.join(rootDir, lot.fichier);
      expect(fs.existsSync(fichier)).toBe(true);
      const contenu = fs.readFileSync(fichier, 'utf8');
      expect(contenu).toContain(`id="${lot.id}"`);
      expect(contenu).toContain('class="boss-rush__lot"');
      lot.fragments.forEach((rel) => {
        const fragment = fs.readFileSync(path.join(rootDir, rel), 'utf8').trim();
        expect(contenu).toContain(fragment.slice(0, 40));
      });
    });

    expect(fs.existsSync(path.join(rootDir, FICHIER_LEGACY))).toBe(false);
    expect(FRAGMENTS_BOSS).toHaveLength(11);
    expect(LOTS.flatMap((lot) => lot.fragments)).toEqual(FRAGMENTS_BOSS);
    expect(fs.readFileSync(path.join(rootDir, LOTS[0].fichier), 'utf8')).toContain(
      'data-boss="domslayer"'
    );
    expect(fs.readFileSync(path.join(rootDir, LOTS[2].fichier), 'utf8')).toContain(
      'data-boss="react"'
    );
  });
});
