import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { creerTmp } from './fs-utils-test-helpers.js';

const require = createRequire(import.meta.url);
const { prepareStagingDir } = require('./fs-utils.cjs');

describe('fs-utils staging', () => {
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

  it('prepareStagingDir remplace un staging existant', () => {
    const base = creerTmp('portfolio-fs-prepare-');
    const staging = path.join(base, 'staging');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'old.txt'), 'old', 'utf8');

    prepareStagingDir(staging);

    expect(fs.existsSync(staging)).toBe(true);
    expect(fs.existsSync(path.join(staging, 'old.txt'))).toBe(false);
  });

  it('promouvoirStaging refuse un workDir absent', () => {
    const { promouvoirStaging } = require('./fs-utils.cjs');
    const base = creerTmp('portfolio-fs-promo-absent-');
    expect(() => promouvoirStaging(path.join(base, 'absent'), path.join(base, 'staging'))).toThrow(
      /introuvable/i
    );
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
