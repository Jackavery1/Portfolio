import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';
import {
  avecRepertoireTemporaire,
  avecRepertoireTemporaireAsync,
  creerSharpMock,
} from './images-test-helpers.mjs';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { creerImages, listerRasters, ZONE_UTILE_PWA } = loadBuild('images.cjs');

describe('images.cjs — assets et icônes', () => {
  let sharpMock;

  beforeEach(() => {
    sharpMock = creerSharpMock();
  });

  function images() {
    return creerImages(sharpMock.sharpFactory);
  }

  it('listerRasters filtre PNG et JPEG', () => {
    avecRepertoireTemporaire('portfolio-rasters-', (tmp) => {
      fs.writeFileSync(path.join(tmp, 'a.png'), '');
      fs.writeFileSync(path.join(tmp, 'b.jpg'), '');
      fs.writeFileSync(path.join(tmp, 'c.svg'), '');
      expect(listerRasters(tmp).sort()).toEqual(['a.png', 'b.jpg']);
    });
  });

  it('optimizeImages et optimizePreviewImages délèguent optimizeRasterDir', async () => {
    const api = images();
    const spy = vi.spyOn(api, 'optimizeRasterDir').mockResolvedValue(undefined);
    await api.optimizeImages(rootDir, path.join(rootDir, 'dist'));
    await api.optimizePreviewImages(rootDir, path.join(rootDir, 'dist'));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('copyAssets copie offline.html et ignore les optionnels absents', () => {
    avecRepertoireTemporaire('portfolio-assets-', (tmp) => {
      images().copyAssets(rootDir, tmp);
      expect(fs.existsSync(path.join(tmp, 'offline.html'))).toBe(true);
      const offline = fs.readFileSync(path.join(tmp, 'offline.html'), 'utf8');
      expect(offline).toContain('Mode hors ligne');
      expect(offline).toContain('href="style-page-offline.css"');
      expect(offline).not.toContain('styles/pages/offline.css');
    });
  });

  it('copyAssets ignore les optionnels absents', () => {
    avecRepertoireTemporaire('portfolio-assets-root-', (tmpRoot) => {
      avecRepertoireTemporaire('portfolio-assets-dist-', (tmpDist) => {
        fs.writeFileSync(
          path.join(tmpRoot, 'offline.html'),
          '<title>x</title>\n<link rel="stylesheet" href="styles/pages/offline.css" />'
        );
        images().copyAssets(tmpRoot, tmpDist);
        expect(fs.existsSync(path.join(tmpDist, 'offline.html'))).toBe(true);
        const offline = fs.readFileSync(path.join(tmpDist, 'offline.html'), 'utf8');
        expect(offline).toContain('style-page-offline.css');
        expect(fs.existsSync(path.join(tmpDist, 'assets', 'favicon.png'))).toBe(false);
      });
    });
  });

  it('copyAssets copie un répertoire source', () => {
    const fsUtils = loadBuild('fs-utils.cjs');
    const copyDirSpy = vi.spyOn(fsUtils, 'copyDirRecursive').mockImplementation(() => {});
    const copyFileSpy = vi.spyOn(fsUtils, 'copyFile').mockReturnValue(true);
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const statSpy = vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true });

    try {
      images().copyAssets(path.join(rootDir, 'fake-root'), path.join(rootDir, 'fake-dist'));
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
    await avecRepertoireTemporaireAsync('portfolio-pwa-absent-', async (tmp) => {
      await expect(images().generatePwaIcons(tmp, path.join(tmp, 'dist'))).resolves.toBeUndefined();
      expect(sharpMock.instances).toHaveLength(0);
    });
  });

  it('generatePwaIcons écrit les trois tailles en racine et dist', async () => {
    await avecRepertoireTemporaireAsync('portfolio-pwa-ok-', async (tmp) => {
      fs.mkdirSync(path.join(tmp, 'assets'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'assets', 'favicon.png'), 'png');
      const dist = path.join(tmp, 'dist');
      await images().generatePwaIcons(tmp, dist);
      for (const name of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
        expect(fs.existsSync(path.join(tmp, 'assets', name))).toBe(true);
        expect(fs.existsSync(path.join(dist, 'assets', name))).toBe(true);
      }
    });
  });

  it('genererIconeCarreePwa produit un buffer carré', async () => {
    const buffer = await images().genererIconeCarreePwa(
      path.join(rootDir, 'assets', 'favicon.png'),
      192
    );
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(ZONE_UTILE_PWA).toBeLessThan(0.6);
    expect(sharpMock.instances.length).toBeGreaterThan(0);
  });
});
