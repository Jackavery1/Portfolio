import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { creerTmp } from './fs-utils-test-helpers.js';

const require = createRequire(import.meta.url);
const { ensureDir, copyFile, walkJsFiles } = require('./fs-utils.cjs');

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('fs-utils fichiers', () => {
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

  it('copyFile remplace un fichier existant via fichier temporaire', () => {
    const base = creerTmp('portfolio-fs-copy-tmp-');
    const src = path.join(base, 'source.txt');
    const dst = path.join(base, 'dest.txt');
    fs.writeFileSync(src, 'nouveau', 'utf8');
    fs.writeFileSync(dst, 'ancien', 'utf8');

    expect(copyFile(src, dst)).toBe(true);
    expect(fs.readFileSync(dst, 'utf8')).toBe('nouveau');
  });

  it('copyFile récupère un EPERM initial via fichier temporaire', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-eperm-');
    const src = path.join(base, 'source.txt');
    const dst = path.join(base, 'dest.txt');
    fs.writeFileSync(src, 'ok', 'utf8');

    let appels = 0;
    const original = fsModule.copyFileSync;
    fsModule.copyFileSync = (source, cible) => {
      appels += 1;
      if (appels === 1) {
        const err = new Error('EPERM');
        err.code = 'EPERM';
        throw err;
      }
      return original(source, cible);
    };

    try {
      expect(copyFile(src, dst)).toBe(true);
      expect(fs.readFileSync(dst, 'utf8')).toBe('ok');
    } finally {
      fsModule.copyFileSync = original;
    }
  });

  it('ecrireFichierTexte propage l’erreur après les tentatives', () => {
    const fsModule = require('node:fs');
    const { ecrireFichierTexte } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-write-fail-');
    const cible = path.join(base, 'demo.txt');
    const original = fsModule.writeFileSync;

    fsModule.writeFileSync = () => {
      const err = new Error('EACCES');
      err.code = 'EACCES';
      throw err;
    };

    try {
      expect(() => ecrireFichierTexte(cible, 'x', { tentatives: 2, delaiMs: 0 })).toThrow('EACCES');
    } finally {
      fsModule.writeFileSync = original;
    }
  });

  it('copyFile utilise ecrireFichierTexte si rename du tmp échoue', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-text-fallback-');
    const src = path.join(base, 'source.txt');
    const dst = path.join(base, 'dest.txt');
    fs.writeFileSync(src, 'texte', 'utf8');

    let copyCalls = 0;
    const originalCopy = fsModule.copyFileSync;
    const originalRename = fsModule.renameSync;

    fsModule.copyFileSync = (source, cible) => {
      copyCalls += 1;
      if (copyCalls === 1) {
        const err = new Error('EPERM');
        err.code = 'EPERM';
        throw err;
      }
      return originalCopy(source, cible);
    };
    fsModule.renameSync = () => {
      const err = new Error('EBUSY');
      err.code = 'EBUSY';
      throw err;
    };

    try {
      expect(copyFile(src, dst)).toBe(true);
      expect(fs.readFileSync(dst, 'utf8')).toBe('texte');
    } finally {
      fsModule.copyFileSync = originalCopy;
      fsModule.renameSync = originalRename;
    }
  });

  it('copyFile nettoie le tmp si unlink échoue après rename', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-tmp-unlink-');
    const src = path.join(base, 'source.txt');
    const dst = path.join(base, 'dest.txt');
    fs.writeFileSync(src, 'ok', 'utf8');

    let copyCalls = 0;
    const originalCopy = fsModule.copyFileSync;
    const originalRename = fsModule.renameSync;
    const originalUnlink = fsModule.unlinkSync;

    fsModule.copyFileSync = (source, cible) => {
      copyCalls += 1;
      if (copyCalls === 1) {
        const err = new Error('EPERM');
        err.code = 'EPERM';
        throw err;
      }
      return originalCopy(source, cible);
    };
    fsModule.renameSync = () => {
      const err = new Error('EBUSY');
      err.code = 'EBUSY';
      throw err;
    };
    fsModule.unlinkSync = (cible) => {
      if (String(cible).endsWith('.portfolio-tmp')) {
        throw new Error('unlink impossible');
      }
      return originalUnlink(cible);
    };

    try {
      expect(copyFile(src, dst)).toBe(true);
      expect(fs.readFileSync(dst, 'utf8')).toBe('ok');
    } finally {
      fsModule.copyFileSync = originalCopy;
      fsModule.renameSync = originalRename;
      fsModule.unlinkSync = originalUnlink;
    }
  });
});
