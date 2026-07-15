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

  it('copyDirRecursive avec tolererEchecs collecte les chemins en échec', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-tolerer-');
    const src = path.join(base, 'src');
    const dst = path.join(base, 'dst');
    fs.mkdirSync(src, { recursive: true });
    fs.writeFileSync(path.join(src, 'a.txt'), 'A', 'utf8');

    const original = fsModule.copyFileSync;
    fsModule.copyFileSync = () => {
      throw new Error('copie impossible');
    };

    try {
      const echecs = copyDirRecursive(src, dst, { tolererEchecs: true });
      expect(echecs).toHaveLength(1);
      expect(echecs[0]).toMatch(/a\.txt$/);
    } finally {
      fsModule.copyFileSync = original;
    }
  });

  it('prepareStagingDir vide le staging si rename et suppression échouent', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-prepare-lock-');
    const staging = path.join(base, 'staging');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'old.txt'), 'old', 'utf8');

    const originalRename = fsModule.renameSync;
    const originalRm = fsModule.rmSync;
    fsModule.renameSync = () => {
      throw new Error('rename impossible');
    };
    fsModule.rmSync = () => {
      throw new Error('staging verrouillé');
    };

    try {
      prepareStagingDir(staging);
      expect(fs.existsSync(staging)).toBe(true);
      expect(fs.existsSync(path.join(staging, 'old.txt'))).toBe(false);
    } finally {
      fsModule.renameSync = originalRename;
      fsModule.rmSync = originalRm;
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
      expect(() =>
        ecrireFichierTexte(cible, 'x', { tentatives: 2, delaiMs: 0 })
      ).toThrow('EACCES');
    } finally {
      fsModule.writeFileSync = original;
    }
  });

  it('promouvoirStaging retourne false si la copie de repli est partielle', () => {
    const fsModule = require('node:fs');
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-partial-');
    const work = path.join(base, 'work');
    const staging = path.join(base, 'staging');

    fs.mkdirSync(work, { recursive: true });
    fs.writeFileSync(path.join(work, 'a.txt'), 'A', 'utf8');
    fs.writeFileSync(path.join(work, 'b.txt'), 'B', 'utf8');
    fs.mkdirSync(staging, { recursive: true });

    const originalRename = fsModule.renameSync;
    const originalCopy = fsModule.copyFileSync;
    fsModule.renameSync = () => {
      const err = new Error('EPERM');
      err.code = 'EPERM';
      throw err;
    };
    fsModule.copyFileSync = (source, cible) => {
      if (String(cible).endsWith(`${path.sep}b.txt`)) {
        throw new Error('fichier verrouillé');
      }
      return originalCopy(source, cible);
    };

    try {
      expect(promouvoirStaging(work, staging)).toBe(false);
      expect(fs.readFileSync(path.join(staging, 'a.txt'), 'utf8')).toBe('A');
      expect(fs.existsSync(path.join(staging, 'b.txt'))).toBe(false);
      expect(fs.existsSync(work)).toBe(true);
    } finally {
      fsModule.renameSync = originalRename;
      fsModule.copyFileSync = originalCopy;
    }
  });

  it('promouvoirStaging conserve staging.old si suppression impossible', () => {
    const fsModule = require('node:fs');
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-old-');
    const work = path.join(base, 'work');
    const staging = path.join(base, 'staging');

    fs.mkdirSync(work, { recursive: true });
    fs.writeFileSync(path.join(work, 'index.html'), '<html>new</html>', 'utf8');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html>old</html>', 'utf8');

    const originalRm = fsModule.rmSync;
    fsModule.rmSync = (target, options) => {
      if (String(target).endsWith('.old')) {
        const err = new Error('EBUSY');
        err.code = 'EBUSY';
        throw err;
      }
      return originalRm(target, options);
    };

    try {
      expect(promouvoirStaging(work, staging)).toBe(true);
      expect(fs.existsSync(`${staging}.old`)).toBe(true);
    } finally {
      fsModule.rmSync = originalRm;
    }
  });

  it('promouvoirStaging avertit si work/ reste après copie de repli', () => {
    const fsModule = require('node:fs');
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-work-lock-');
    const work = path.join(base, 'work');
    const staging = path.join(base, 'staging');

    fs.mkdirSync(work, { recursive: true });
    fs.writeFileSync(path.join(work, 'index.html'), '<html>copie</html>', 'utf8');
    fs.mkdirSync(staging, { recursive: true });

    const originalRename = fsModule.renameSync;
    const originalRm = fsModule.rmSync;
    fsModule.renameSync = () => {
      const err = new Error('EPERM');
      err.code = 'EPERM';
      throw err;
    };
    fsModule.rmSync = (target, options) => {
      if (target === work) throw new Error('work verrouillé');
      return originalRm(target, options);
    };

    try {
      expect(promouvoirStaging(work, staging)).toBe(true);
      expect(fs.existsSync(work)).toBe(true);
      expect(fs.readFileSync(path.join(staging, 'index.html'), 'utf8')).toBe('<html>copie</html>');
    } finally {
      fsModule.renameSync = originalRename;
      fsModule.rmSync = originalRm;
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

  it('prepareStagingDir supprime un staging.old existant avant rename', () => {
    const base = creerTmp('portfolio-fs-repli-');
    const staging = path.join(base, 'staging');
    const repli = `${staging}.old`;
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'current.txt'), 'current', 'utf8');
    fs.mkdirSync(repli, { recursive: true });
    fs.writeFileSync(path.join(repli, 'old.txt'), 'old', 'utf8');

    prepareStagingDir(staging);

    expect(fs.existsSync(path.join(repli, 'old.txt'))).toBe(false);
    expect(fs.readFileSync(path.join(repli, 'current.txt'), 'utf8')).toBe('current');
    expect(fs.existsSync(path.join(staging, 'current.txt'))).toBe(false);
  });

  it('prepareStagingDir tolère un sous-répertoire verrouillé lors du vidage', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-nested-rmdir-');
    const staging = path.join(base, 'staging');
    const nested = path.join(staging, 'nested');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'file.txt'), 'x', 'utf8');

    const originalRename = fsModule.renameSync;
    const originalRm = fsModule.rmSync;
    const originalRmdir = fsModule.rmdirSync;
    fsModule.renameSync = () => {
      throw new Error('lock');
    };
    fsModule.rmSync = () => {
      throw new Error('lock');
    };
    fsModule.rmdirSync = () => {
      throw new Error('rmdir lock');
    };

    try {
      expect(() => prepareStagingDir(staging)).not.toThrow();
      expect(fs.existsSync(staging)).toBe(true);
      expect(fs.existsSync(nested)).toBe(true);
    } finally {
      fsModule.renameSync = originalRename;
      fsModule.rmSync = originalRm;
      fsModule.rmdirSync = originalRmdir;
    }
  });

  it('prepareStagingDir tolère un fichier verrouillé dans le staging', () => {
    const fsModule = require('node:fs');
    const base = creerTmp('portfolio-fs-vider-lock-');
    const staging = path.join(base, 'staging');
    const locked = path.join(staging, 'locked.txt');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(locked, 'stay', 'utf8');

    const originalRename = fsModule.renameSync;
    const originalRm = fsModule.rmSync;
    const originalUnlink = fsModule.unlinkSync;
    fsModule.renameSync = () => {
      throw new Error('lock');
    };
    fsModule.rmSync = () => {
      throw new Error('lock');
    };
    fsModule.unlinkSync = (cible) => {
      if (cible === locked) throw new Error('file locked');
      return originalUnlink(cible);
    };

    try {
      expect(() => prepareStagingDir(staging)).not.toThrow();
      expect(fs.existsSync(locked)).toBe(true);
    } finally {
      fsModule.renameSync = originalRename;
      fsModule.rmSync = originalRm;
      fsModule.unlinkSync = originalUnlink;
    }
  });
});
