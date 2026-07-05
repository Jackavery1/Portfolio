import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ensureDir, copyFile, walkJsFiles } = require('./fs-utils.cjs');

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
});
