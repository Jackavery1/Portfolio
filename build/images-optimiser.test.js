import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadBuild } from './cjs-bridge.mjs';
import { avecRepertoireTemporaireAsync, creerSharpMock } from './images-test-helpers.mjs';

const { creerImages, PNG_QUALITE_PAR_FICHIER, OG_LARGEUR_MAX } = loadBuild('images.cjs');

describe('images.cjs — optimisation raster', () => {
  let sharpMock;

  beforeEach(() => {
    sharpMock = creerSharpMock();
  });

  function images() {
    return creerImages(sharpMock.sharpFactory);
  }

  it('optimiserUneImage — JPEG + WebP', async () => {
    await avecRepertoireTemporaireAsync('portfolio-jpeg-', async (tmp) => {
      const src = path.join(tmp, 'photo.jpg');
      const dst = path.join(tmp, 'out', 'photo.jpg');
      fs.mkdirSync(path.join(tmp, 'out'), { recursive: true });
      fs.writeFileSync(src, 'jpeg');
      await images().optimiserUneImage({
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
    });
  });

  it('optimiserUneImage — PNG og.png avec palette', async () => {
    await avecRepertoireTemporaireAsync('portfolio-png-og-', async (tmp) => {
      const src = path.join(tmp, 'og.png');
      const dst = path.join(tmp, 'out', 'og.png');
      fs.mkdirSync(path.join(tmp, 'out'));
      fs.writeFileSync(src, 'png');
      await images().optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.png',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'og.png',
      });
      expect(PNG_QUALITE_PAR_FICHIER['og.png']).toBe(62);
      expect(OG_LARGEUR_MAX).toBe(1200);
      expect(sharpMock.instances[0].resize).toHaveBeenCalledWith({
        width: 1200,
        withoutEnlargement: true,
      });
      expect(sharpMock.instances[0].png).toHaveBeenCalledWith(
        expect.objectContaining({ palette: true, quality: 62 })
      );
    });
  });

  it('optimiserUneImage — PNG standard', async () => {
    await avecRepertoireTemporaireAsync('portfolio-png-', async (tmp) => {
      const src = path.join(tmp, 'favicon.png');
      const dst = path.join(tmp, 'out', 'favicon.png');
      fs.mkdirSync(path.join(tmp, 'out'));
      fs.writeFileSync(src, 'png');
      await images().optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.png',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'favicon.png',
      });
      expect(sharpMock.instances[0].png).toHaveBeenCalledWith(
        expect.objectContaining({ palette: false, quality: 75 })
      );
    });
  });

  it('optimiserUneImage — extension inconnue copie le fichier', async () => {
    await avecRepertoireTemporaireAsync('portfolio-bmp-', async (tmp) => {
      const src = path.join(tmp, 'scan.bmp');
      const dst = path.join(tmp, 'out', 'scan.bmp');
      fs.mkdirSync(path.join(tmp, 'out'));
      fs.writeFileSync(src, 'bmp');
      await images().optimiserUneImage({
        srcPath: src,
        dstPath: dst,
        ext: '.bmp',
        qualiteJpeg: 80,
        qualitePng: 75,
        qualiteWebp: 70,
        nomFichier: 'scan.bmp',
      });
      expect(fs.readFileSync(dst, 'utf8')).toBe('bmp');
    });
  });

  it('optimizeRasterDir ignore un répertoire source absent', async () => {
    await avecRepertoireTemporaireAsync('portfolio-opt-absent-', async (tmp) => {
      await expect(
        images().optimizeRasterDir({
          srcDir: path.join(tmp, 'inexistant'),
          dstDir: path.join(tmp, 'out'),
          label: 'test/',
          options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
        })
      ).resolves.toBeUndefined();
    });
  });

  it('optimizeRasterDir ignore un répertoire sans raster', async () => {
    await avecRepertoireTemporaireAsync('portfolio-opt-vide-', async (tmp) => {
      const srcDir = path.join(tmp, 'src');
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'notes.txt'), '');
      await images().optimizeRasterDir({
        srcDir,
        dstDir: path.join(tmp, 'out'),
        label: 'test/',
        options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
      });
      expect(fs.existsSync(path.join(tmp, 'out'))).toBe(false);
    });
  });

  it('optimizeRasterDir optimise les images présentes', async () => {
    await avecRepertoireTemporaireAsync('portfolio-opt-ok-', async (tmp) => {
      const srcDir = path.join(tmp, 'src');
      fs.mkdirSync(srcDir);
      fs.writeFileSync(path.join(srcDir, 'a.png'), 'png');
      await images().optimizeRasterDir({
        srcDir,
        dstDir: path.join(tmp, 'out'),
        label: 'test/',
        options: { jpegQuality: 80, pngQuality: 75, webpQuality: 75 },
      });
      expect(sharpMock.instances.length).toBeGreaterThan(0);
    });
  });

  it('optimizeRasterDir copie le dossier si onError=copy', async () => {
    await avecRepertoireTemporaireAsync('portfolio-opt-copy-', async (tmp) => {
      const api = images();
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
    });
  });

  it('optimizeRasterDir propage l’erreur sans onError', async () => {
    await avecRepertoireTemporaireAsync('portfolio-opt-throw-', async (tmp) => {
      const api = images();
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
    });
  });

  it('optimizePreviewImages ne conserve que le WebP en dist', async () => {
    await avecRepertoireTemporaireAsync('portfolio-prev-webp-', async (tmp) => {
      const api = images();
      const srcDir = path.join(tmp, 'assets', 'previews');
      const dist = path.join(tmp, 'dist');
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'demo.png'), 'png');
      vi.spyOn(api, 'optimiserUneImage').mockImplementation(async ({ dstPath }) => {
        fs.mkdirSync(path.dirname(dstPath), { recursive: true });
        fs.writeFileSync(dstPath, 'png');
        fs.writeFileSync(dstPath.replace(/\.png$/i, '.webp'), 'webp');
      });
      await api.optimizePreviewImages(tmp, dist);
      const dstDir = path.join(dist, 'assets', 'previews');
      expect(fs.existsSync(path.join(dstDir, 'demo.webp'))).toBe(true);
      expect(fs.existsSync(path.join(dstDir, 'demo.png'))).toBe(false);
    });
  });
});
