import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  ensureDir,
  copyFile,
  walkJsFiles,
  copyDirRecursive,
  createDist,
  finalizeDist,
  prepareStagingDir,
} = require('./fs-utils.cjs');

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('fs-utils', () => {
  /** @type {string[]} */
  let tmpDirs = [];

  afterEach(() => {
    tmpDirs.forEach((dir) => {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    });
    tmpDirs = [];
  });

  function creerTmp(prefix) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    tmpDirs.push(dir);
    return dir;
  }

  it('ensureDir crée les dossiers parents manquants', () => {
    const base = creerTmp('portfolio-fs-');
    const cible = path.join(base, 'a', 'b', 'c');
    ensureDir(cible);
    expect(fs.existsSync(cible)).toBe(true);
  });

  it('copyFile copie un fichier vers une destination', () => {
    const base = creerTmp('portfolio-fs-');
    const src = path.join(base, 'source.txt');
    const dst = path.join(base, 'nested', 'dest.txt');
    fs.writeFileSync(src, 'demo', 'utf8');

    expect(copyFile(src, dst)).toBe(true);
    expect(fs.readFileSync(dst, 'utf8')).toBe('demo');
  });

  it('copyFile retourne false si la source est absente', () => {
    const base = creerTmp('portfolio-fs-');
    expect(copyFile(path.join(base, 'absent.txt'), path.join(base, 'out.txt'))).toBe(false);
  });

  it('walkJsFiles ignore les tests et parcourt les sous-dossiers', () => {
    const fichiers = walkJsFiles(path.join(rootDir, 'js', 'utils'));
    expect(fichiers.some((f) => f.endsWith('dom.js'))).toBe(true);
    expect(fichiers.some((f) => f.endsWith('dom.test.js'))).toBe(false);
  });

  it('walkJsFiles ignore le dossier test-fixtures', () => {
    const fichiers = walkJsFiles(path.join(rootDir, 'js'));
    expect(fichiers.some((f) => f.includes(`${path.sep}test-fixtures${path.sep}`))).toBe(false);
  });

  it('ecrireFichierTexte écrit puis remplace un fichier existant', () => {
    const { ecrireFichierTexte } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-write-');
    const cible = path.join(base, 'demo.txt');

    ecrireFichierTexte(cible, 'v1');
    ecrireFichierTexte(cible, 'v2');

    expect(fs.readFileSync(cible, 'utf8')).toBe('v2');
  });

  it('promouvoirStaging remplace le staging par un build frais', () => {
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-');
    const work = path.join(base, 'work');
    const staging = path.join(base, 'staging');

    fs.mkdirSync(work, { recursive: true });
    fs.writeFileSync(path.join(work, 'index.html'), '<html>new</html>', 'utf8');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html>old</html>', 'utf8');

    expect(promouvoirStaging(work, staging)).toBe(true);

    expect(fs.existsSync(work)).toBe(false);
    expect(fs.readFileSync(path.join(staging, 'index.html'), 'utf8')).toBe('<html>new</html>');
    expect(fs.existsSync(`${staging}.old`)).toBe(false);
  });

  it('promouvoirStaging bascule en copie si rename échoue', () => {
    const fsModule = require('node:fs');
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-copy-');
    const work = path.join(base, 'work');
    const staging = path.join(base, 'staging');
    const originalRename = fsModule.renameSync;

    fs.mkdirSync(work, { recursive: true });
    fs.writeFileSync(path.join(work, 'index.html'), '<html>copie</html>', 'utf8');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html>old</html>', 'utf8');

    let renameCalls = 0;
    fsModule.renameSync = (...args) => {
      renameCalls += 1;
      if (renameCalls === 1) {
        const err = new Error('EPERM');
        err.code = 'EPERM';
        throw err;
      }
      return originalRename.apply(fsModule, args);
    };

    try {
      expect(promouvoirStaging(work, staging)).toBe(true);
      expect(fs.readFileSync(path.join(staging, 'index.html'), 'utf8')).toBe('<html>copie</html>');
    } finally {
      fsModule.renameSync = originalRename;
    }
  });

  it('copyDirRecursive copie une arborescence', () => {
    const base = creerTmp('portfolio-fs-tree-');
    const src = path.join(base, 'src');
    const dst = path.join(base, 'dst');
    fs.mkdirSync(path.join(src, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(src, 'a.txt'), 'A', 'utf8');
    fs.writeFileSync(path.join(src, 'nested', 'b.txt'), 'B', 'utf8');

    copyDirRecursive(src, dst);

    expect(fs.readFileSync(path.join(dst, 'a.txt'), 'utf8')).toBe('A');
    expect(fs.readFileSync(path.join(dst, 'nested', 'b.txt'), 'utf8')).toBe('B');
  });

  it('copyDirRecursive retourne un tableau vide si la source est absente', () => {
    const base = creerTmp('portfolio-fs-tree-absent-');
    expect(copyDirRecursive(path.join(base, 'absent'), path.join(base, 'dst'))).toEqual([]);
  });

  it('createDist prépare un répertoire de build vide', () => {
    const base = creerTmp('portfolio-fs-create-');
    const staging = path.join(base, 'staging');
    createDist(staging);
    expect(fs.existsSync(staging)).toBe(true);
  });

  it('prepareStagingDir remplace un staging existant', () => {
    const base = creerTmp('portfolio-fs-prepare-');
    const staging = path.join(base, 'staging');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'old.txt'), 'old', 'utf8');

    prepareStagingDir(staging);

    expect(fs.existsSync(staging)).toBe(true);
    expect(fs.existsSync(path.join(staging, 'old.txt'))).toBe(false);
  });

  it('finalizeDist synchronise staging vers dist', () => {
    const base = creerTmp('portfolio-fs-finalize-');
    const staging = path.join(base, 'staging');
    const dist = path.join(base, 'dist');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html>ok</html>', 'utf8');

    finalizeDist(staging, dist);

    expect(fs.readFileSync(path.join(dist, 'index.html'), 'utf8')).toBe('<html>ok</html>');
  });

  it('promouvoirStaging refuse un workDir absent', () => {
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-absent-');
    expect(() => promouvoirStaging(path.join(base, 'absent'), path.join(base, 'staging'))).toThrow(
      /introuvable/i
    );
  });

  it('copyFile remplace un fichier existant via fichier temporaire', () => {
    const base = creerTmp('portfolio-fs-copy-tmp-');
    const src = path.join(base, 'source.txt');
    const dst = path.join(base, 'dest.txt');
    fs.writeFileSync(src, 'nouveau', 'utf8');
    fs.writeFileSync(dst, 'ancien', 'utf8');

    expect(copyFile(src, dst)).toBe(true);
    expect(fs.readFileSync(dst, 'utf8')).toBe('nouveau');
  });
});
