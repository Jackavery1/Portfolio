import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveStaticDistDir } = require('./resolve-static-dist.cjs');

describe('resolve-static-dist', () => {
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

  it('retourne le fallback si aucun artefact build', () => {
    const base = creerTmp('portfolio-static-dist-');
    expect(resolveStaticDistDir(base)).toBe('./.dist-staging');
  });

  it('retourne le chemin relatif du staging servi', () => {
    const base = creerTmp('portfolio-static-dist-staging-');
    fs.mkdirSync(path.join(base, '.dist-staging'), { recursive: true });
    expect(resolveStaticDistDir(base)).toBe('./.dist-staging');
  });

  it('préfère .dist-staging-build pour Lighthouse', () => {
    const base = creerTmp('portfolio-static-dist-work-');
    fs.mkdirSync(path.join(base, '.dist-staging-build'), { recursive: true });
    fs.mkdirSync(path.join(base, '.dist-staging'), { recursive: true });
    expect(resolveStaticDistDir(base)).toBe('./.dist-staging-build');
  });
});
