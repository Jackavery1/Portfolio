import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { creerTmp } from './fs-utils-test-helpers.js';

const require = createRequire(import.meta.url);
const { copyDirRecursive, createDist, finalizeDist } = require('./fs-utils.cjs');

describe('fs-utils dossiers', () => {
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

  it('finalizeDist synchronise staging vers dist', () => {
    const base = creerTmp('portfolio-fs-finalize-');
    const staging = path.join(base, 'staging');
    const dist = path.join(base, 'dist');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html>ok</html>', 'utf8');

    finalizeDist(staging, dist);

    expect(fs.readFileSync(path.join(dist, 'index.html'), 'utf8')).toBe('<html>ok</html>');
  });

  it('finalizeDist retire les fichiers absents du staging', () => {
    const base = creerTmp('portfolio-fs-finalize-prune-');
    const staging = path.join(base, 'staging');
    const dist = path.join(base, 'dist');
    fs.mkdirSync(path.join(staging, 'assets'), { recursive: true });
    fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html>ok</html>', 'utf8');
    fs.writeFileSync(path.join(staging, 'assets', 'og.webp'), 'webp', 'utf8');
    fs.writeFileSync(path.join(dist, 'index.html'), 'ancien', 'utf8');
    fs.writeFileSync(path.join(dist, 'assets', 'og.png'), 'png', 'utf8');
    fs.writeFileSync(path.join(dist, 'assets', 'og.webp'), 'vieux', 'utf8');

    finalizeDist(staging, dist);

    expect(fs.readFileSync(path.join(dist, 'index.html'), 'utf8')).toBe('<html>ok</html>');
    expect(fs.readFileSync(path.join(dist, 'assets', 'og.webp'), 'utf8')).toBe('webp');
    expect(fs.existsSync(path.join(dist, 'assets', 'og.png'))).toBe(false);
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
});
