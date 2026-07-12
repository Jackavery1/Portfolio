import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const { syncDojoBoss, FRAGMENTS_BOSS, LOTS, FICHIER_LEGACY } = loadBuild('sync-dojo-boss.cjs');

const tmpDirs = [];

function creerRacineTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-dojo-boss-'));
  tmpDirs.push(tmp);
  return tmp;
}

function copierFragmentsBoss(destination) {
  FRAGMENTS_BOSS.forEach((rel) => {
    const cible = path.join(destination, rel);
    fs.mkdirSync(path.dirname(cible), { recursive: true });
    fs.copyFileSync(path.join(rootDir, rel), cible);
  });
}

afterEach(() => {
  tmpDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('sync-dojo-boss', () => {
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

  it('supprime le partial legacy s’il existe', () => {
    const tmp = creerRacineTest();
    copierFragmentsBoss(tmp);
    fs.writeFileSync(path.join(tmp, FICHIER_LEGACY), '<div>legacy</div>', 'utf8');

    syncDojoBoss(tmp);

    expect(fs.existsSync(path.join(tmp, FICHIER_LEGACY))).toBe(false);
    expect(fs.existsSync(path.join(tmp, LOTS[0].fichier))).toBe(true);
  });

  it('échoue si un fragment boss est manquant', () => {
    const tmp = creerRacineTest();
    const fragmentsSansPremier = FRAGMENTS_BOSS.slice(1);
    fragmentsSansPremier.forEach((rel) => {
      const cible = path.join(tmp, rel);
      fs.mkdirSync(path.dirname(cible), { recursive: true });
      fs.copyFileSync(path.join(rootDir, rel), cible);
    });

    expect(() => syncDojoBoss(tmp)).toThrow(/Fragment manquant/);
  });
});
