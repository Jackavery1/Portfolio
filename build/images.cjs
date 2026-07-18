const fs = require('fs');
const path = require('path');
const sharpDefaut = require('sharp');
const { ensureDir, copyDirRecursive, log, copyFile } = require('./fs-utils.cjs');
const { ZONE_UTILE_PWA, FOND_PWA, attacherApiPwa } = require('./images-pwa.cjs');
const { attacherApiAssets } = require('./images-assets.cjs');

/** Qualité PNG par fichier (assets racine) — og et icônes PWA */
const PNG_QUALITE_PAR_FICHIER = {
  'og.png': 62,
};

/** Largeur max OG (réseaux sociaux) — redimensionnement au build */
const OG_LARGEUR_MAX = 1200;

/** Largeur max previews projets (modale ≪ 1024 px source) */
const PREVIEW_LARGEUR_MAX = 800;

/** Icônes PWA / favicon : servies en PNG uniquement (pas de .webp orphelin dans dist). */
const RASTERS_SANS_WEBP = new Set([
  'favicon.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
]);

function listerRasters(srcDir) {
  return fs.readdirSync(srcDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
}

function creerImages(sharpLib = sharpDefaut) {
  const api = {};

  api.optimiserUneImage = async function optimiserUneImage({
    srcPath,
    dstPath,
    ext,
    qualiteJpeg,
    qualitePng,
    qualiteWebp,
    nomFichier,
    largeurMax,
  }) {
    const image = sharpLib(srcPath, { failOn: 'none' });
    const largeurCible = nomFichier === 'og.png' ? OG_LARGEUR_MAX : largeurMax || null;

    function pipelineAvecResize() {
      let pipeline = image.rotate();
      if (largeurCible) {
        pipeline = pipeline.resize({ width: largeurCible, withoutEnlargement: true });
      }
      return pipeline;
    }

    const pipeline = pipelineAvecResize();
    const qualitePngEffective = PNG_QUALITE_PAR_FICHIER[nomFichier] ?? qualitePng;

    if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: qualiteJpeg, mozjpeg: true }).toFile(dstPath);
    } else if (ext === '.png') {
      await pipeline
        .png({
          quality: qualitePngEffective,
          compressionLevel: 9,
          palette: nomFichier === 'og.png' || RASTERS_SANS_WEBP.has(nomFichier),
        })
        .toFile(dstPath);
    } else {
      await copyFile(srcPath, dstPath);
    }

    if (!RASTERS_SANS_WEBP.has(nomFichier)) {
      const webpPath = dstPath.replace(/\.(png|jpe?g)$/i, '.webp');
      await pipelineAvecResize().webp({ quality: qualiteWebp }).toFile(webpPath);
    }
  };

  api.optimizeRasterDir = async function optimizeRasterDir({
    srcDir,
    dstDir,
    label,
    options,
    onError,
    largeurMax,
  }) {
    if (!fs.existsSync(srcDir)) {
      log(`Pas de ${label} — ignoré`, 'warning');
      return;
    }

    const raster = listerRasters(srcDir);
    if (raster.length === 0) {
      log(`Aucune image PNG/JPEG dans ${label}`, 'warning');
      return;
    }

    try {
      log(`Optimisation de ${raster.length} image(s) (${label})…`, 'info');
      ensureDir(dstDir);
      for (const name of raster) {
        const srcPath = path.join(srcDir, name);
        const dstPath = path.join(dstDir, name);
        const ext = path.extname(name).toLowerCase();
        await api.optimiserUneImage({
          srcPath,
          dstPath,
          ext,
          nomFichier: name,
          qualiteJpeg: options.jpegQuality,
          qualitePng: options.pngQuality,
          qualiteWebp: options.webpQuality,
          largeurMax,
        });
      }
      log(`Images → ${dstDir}`, 'success');
    } catch (err) {
      log(`Erreur optimisation ${label}: ${err.message}`, 'error');
      if (onError === 'copy') {
        copyDirRecursive(srcDir, dstDir);
        return;
      }
      throw err;
    }
  };

  api.optimizeImages = async function optimizeImages(root, distDir) {
    await api.optimizeRasterDir({
      srcDir: path.join(root, 'assets'),
      dstDir: path.join(distDir, 'assets'),
      label: 'assets/',
      options: {
        jpegQuality: 80,
        pngQuality: 75,
        webpQuality: 75,
      },
    });
  };

  api.optimizePreviewImages = async function optimizePreviewImages(root, distDir) {
    const dstDir = path.join(distDir, 'assets', 'previews');
    await api.optimizeRasterDir({
      srcDir: path.join(root, 'assets', 'previews'),
      dstDir,
      label: 'assets/previews/',
      options: {
        jpegQuality: 80,
        pngQuality: 78,
        webpQuality: 72,
      },
      largeurMax: PREVIEW_LARGEUR_MAX,
      onError: 'copy',
    });
    if (!fs.existsSync(dstDir)) return;
    for (const name of listerRasters(dstDir)) {
      const pngPath = path.join(dstDir, name);
      const webpPath = pngPath.replace(/\.(png|jpe?g)$/i, '.webp');
      if (fs.existsSync(webpPath)) {
        fs.unlinkSync(pngPath);
      }
    }
  };

  attacherApiAssets(api);
  attacherApiPwa(api, sharpLib);

  return api;
}

const api = creerImages();

module.exports = {
  listerRasters,
  creerImages,
  PNG_QUALITE_PAR_FICHIER,
  OG_LARGEUR_MAX,
  PREVIEW_LARGEUR_MAX,
  ZONE_UTILE_PWA,
  FOND_PWA,
  RASTERS_SANS_WEBP,
  ...api,
};
