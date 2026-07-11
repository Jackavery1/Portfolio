import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { creerImages, listerRasters, PNG_QUALITE_PAR_FICHIER, ZONE_UTILE_PWA } =
  loadBuild('images.cjs');

function creerSharpMock() {
  const instances = [];
  function sharpFactory() {
    const instance = {
      rotate: vi.fn(function rotate() {
        return this;
      }),
      jpeg: vi.fn(function jpeg() {
        return this;
      }),
      png: vi.fn(function png() {
        return this;
      }),
      webp: vi.fn(function webp() {
        return this;
      }),
      resize: vi.fn(function resize() {
        return this;
      }),
      composite: vi.fn(function composite() {
        return this;
      }),
      toFile: vi.fn(() => Promise.resolve()),
      toBuffer: vi.fn(() => Promise.resolve(Buffer.from([0x89, 0x50, 0x4e, 0x47]))),
      metadata: vi.fn(() => Promise.resolve({ width: 80, height: 80 })),
    };
    instances.push(instance);
    return instance;
  }
  return { sharpFactory, instances };
}

describe('images.cjs', () => {
  let sharpMock;

  beforeEach(() => {
    sharpMock = creerSharpMock();
  });

  function images() {
    return creerImages(sharpMock.sharpFactory);
  }

  it('listerRasters filtre PNG et JPEG', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-rasters-'));
    try {
      fs.writeFileSync(path.join(tmp, 'a.png'), '');
      fs.writeFileSync(path.join(tmp, 'b.jpg'), '');
      fs.writeFileSync(path.join(tmp, 'c.svg'), '');
      expect(listerRasters(tmp).sort()).toEqual(['a.png', 'b.jpg']);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimiserUneImage — JPEG + WebP', async () => {
    const { optimiserUneImage } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-jpeg-'));
    try {
      const src = path.join(tmp, 'photo.jpg');
      const dst = path.join(tmp, 'out', 'photo.jpg');
      fs.mkdirSync(path.join(tmp, 'out'), { recursive: true });
      fs.writeFileSync(src, 'jpeg');
      await optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.jpg',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'photo.jpg',
      });
      expect(sharpMock.instances[0].jpeg).toHaveBeenCalled();
      expect(sharpMock.instances[0].webp).toHaveBeenCalled();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimiserUneImage — PNG og.png avec palette', async () => {
    const { optimiserUneImage } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-png-og-'));
    try {
      const src = path.join(tmp, 'og.png');
      const dst = path.join(tmp, 'out', 'og.png');
      fs.mkdirSync(path.join(tmp, 'out'));
      fs.writeFileSync(src, 'png');
      await optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.png',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'og.png',
      });
      expect(PNG_QUALITE_PAR_FICHIER['og.png']).toBe(68);
      expect(sharpMock.instances[0].png).toHaveBeenCalledWith(
        expect.objectContaining({ palette: true, quality: 68 })
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimiserUneImage — PNG standard', async () => {
    const { optimiserUneImage } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-png-'));
    try {
      const src = path.join(tmp, 'favicon.png');
      const dst = path.join(tmp, 'out', 'favicon.png');
      fs.mkdirSync(path.join(tmp, 'out'));
      fs.writeFileSync(src, 'png');
      await optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.png',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'favicon.png',
      });
      expect(sharpMock.instances[0].png).toHaveBeenCalledWith(
        expect.objectContaining({ palette: false, quality: 78 })
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimiserUneImage — extension inconnue copie le fichier', async () => {
    const { optimiserUneImage } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-bmp-'));
    try {
      const src = path.join(tmp, 'scan.bmp');
      const dst = path.join(tmp, 'out', 'scan.bmp');
      fs.mkdirSync(path.join(tmp, 'out'));
      fs.writeFileSync(src, 'bmp');
      await optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.bmp',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'scan.bmp',
      });
      expect(fs.readFileSync(dst, 'utf8')).toBe('bmp');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimizeRasterDir ignore un répertoire source absent', async () => {
    const { optimizeRasterDir } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-opt-absent-'));
    try {
      await expect(
        optimizeRasterDir({
          srcDir: path.join(tmp, 'inexistant'),
          dstDir: path.join(tmp, 'out'),
          label: 'test/',
          options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
        })
      ).resolves.toBeUndefined();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimizeRasterDir ignore un répertoire sans raster', async () => {
    const { optimizeRasterDir } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-opt-vide-'));
    try {
      const srcDir = path.join(tmp, 'src');
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'notes.txt'), '');
      await optimizeRasterDir({
        srcDir,
        dstDir: path.join(tmp, 'out'),
        label: 'test/',
        options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
      });
      expect(fs.existsSync(path.join(tmp, 'out'))).toBe(false);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimizeRasterDir optimise les images présentes', async () => {
    const { optimizeRasterDir } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-opt-ok-'));
    try {
      const srcDir = path.join(tmp, 'src');
      const dstDir = path.join(tmp, 'out');
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'a.png'), 'png');
      await optimizeRasterDir({
        srcDir,
        dstDir,
        label: 'test/',
        options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
      });
      expect(sharpMock.instances.length).toBeGreaterThan(0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimizeRasterDir copie le dossier si onError=copy', async () => {
    const api = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-opt-copy-'));
    try {
      const srcDir = path.join(tmp, 'src');
      const dstDir = path.join(tmp, 'out');
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'a.png'), 'png');
      vi.spyOn(api, 'optimiserUneImage').mockRejectedValueOnce(new Error('sharp fail'));
      await api.optimizeRasterDir({
        srcDir,
        dstDir,
        label: 'test/',
        options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
        onError: 'copy',
      });
      expect(fs.existsSync(path.join(dstDir, 'a.png'))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimizeRasterDir propage l’erreur sans onError', async () => {
    const api = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-opt-throw-'));
    try {
      const srcDir = path.join(tmp, 'src');
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'a.png'), 'png');
      vi.spyOn(api, 'optimiserUneImage').mockRejectedValueOnce(new Error('sharp fail'));
      await expect(
        api.optimizeRasterDir({
          srcDir,
          dstDir: path.join(tmp, 'out'),
          label: 'test/',
          options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
        })
      ).rejects.toThrow('sharp fail');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('optimizeImages et optimizePreviewImages délèguent optimizeRasterDir', async () => {
    const api = images();
    const spy = vi.spyOn(api, 'optimizeRasterDir').mockResolvedValue(undefined);
    await api.optimizeImages(rootDir, path.join(rootDir, 'dist'));
    await api.optimizePreviewImages(rootDir, path.join(rootDir, 'dist'));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('copyAssets copie offline.html et ignore les optionnels absents', () => {
    const { copyAssets } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-assets-'));
    try {
      copyAssets(rootDir, tmp);
      expect(fs.existsSync(path.join(tmp, 'offline.html'))).toBe(true);
      expect(fs.readFileSync(path.join(tmp, 'offline.html'), 'utf8')).toContain('Mode hors ligne');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('copyAssets ignore les optionnels absents', () => {
    const { copyAssets } = images();
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-assets-root-'));
    const tmpDist = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-assets-dist-'));

    try {
      fs.writeFileSync(path.join(tmpRoot, 'offline.html'), 'offline');
      copyAssets(tmpRoot, tmpDist);
      expect(fs.existsSync(path.join(tmpDist, 'offline.html'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDist, 'assets', 'favicon.png'))).toBe(false);
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
      fs.rmSync(tmpDist, { recursive: true, force: true });
    }
  });

  it('copyAssets copie un répertoire source', () => {
    const fsUtils = loadBuild('fs-utils.cjs');
    const { copyAssets } = images();
    const copyDirSpy = vi.spyOn(fsUtils, 'copyDirRecursive').mockImplementation(() => {});
    const copyFileSpy = vi.spyOn(fsUtils, 'copyFile').mockReturnValue(true);
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const statSpy = vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true });

    try {
      copyAssets(path.join(rootDir, 'fake-root'), path.join(rootDir, 'fake-dist'));
      expect(copyDirSpy.mock.calls.length).toBeGreaterThan(0);
      expect(copyFileSpy).not.toHaveBeenCalled();
    } finally {
      copyDirSpy.mockRestore();
      copyFileSpy.mockRestore();
      existsSpy.mockRestore();
      statSpy.mockRestore();
    }
  });

  it('generatePwaIcons ignore si favicon.png absent', async () => {
    const { generatePwaIcons } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-pwa-absent-'));
    try {
      await expect(generatePwaIcons(tmp, path.join(tmp, 'dist'))).resolves.toBeUndefined();
      expect(sharpMock.instances).toHaveLength(0);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('generatePwaIcons écrit les trois tailles en racine et dist', async () => {
    const { generatePwaIcons } = images();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-pwa-ok-'));
    try {
      fs.mkdirSync(path.join(tmp, 'assets'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'assets', 'favicon.png'), 'png');
      const dist = path.join(tmp, 'dist');
      await generatePwaIcons(tmp, dist);
      for (const name of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
        expect(fs.existsSync(path.join(tmp, 'assets', name))).toBe(true);
        expect(fs.existsSync(path.join(dist, 'assets', name))).toBe(true);
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('genererIconeCarreePwa produit un buffer carré', async () => {
    const { genererIconeCarreePwa } = images();
    const buffer = await genererIconeCarreePwa(path.join(rootDir, 'assets', 'favicon.png'), 192);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(ZONE_UTILE_PWA).toBeLessThan(0.6);
    expect(sharpMock.instances.length).toBeGreaterThan(0);
  });
});
