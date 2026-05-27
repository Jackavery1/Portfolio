const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { ensureDir, copyDirRecursive, log, copyFile } = require('./fs-utils.cjs');

// Retourne les images raster d'un dossier (png/jpg/jpeg).
function listerRasters(srcDir) {
  return fs.readdirSync(srcDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
}

// Optimise une image source et génère aussi sa version webp.
async function optimiserUneImage({
  srcPath,
  dstPath,
  ext,
  qualiteJpeg,
  qualitePng,
  qualiteWebp,
}) {
  const image = sharp(srcPath, { failOn: 'none' });
  const pipeline = image.rotate();

  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline.jpeg({ quality: qualiteJpeg, mozjpeg: true }).toFile(dstPath);
  } else if (ext === '.png') {
    await pipeline.png({ quality: qualitePng, compressionLevel: 9 }).toFile(dstPath);
  } else {
    await copyFile(srcPath, dstPath);
  }

  const webpPath = dstPath.replace(/\.(png|jpe?g)$/i, '.webp');
  await image.rotate().webp({ quality: qualiteWebp }).toFile(webpPath);
}

async function optimizeRasterDir({
  srcDir,
  dstDir,
  label,
  options,
  onError,
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
      await optimiserUneImage({
        srcPath,
        dstPath,
        ext,
        qualiteJpeg: options.jpegQuality,
        qualitePng: options.pngQuality,
        qualiteWebp: options.webpQuality,
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
}

async function optimizeImages(root, distDir) {
  await optimizeRasterDir({
    srcDir: path.join(root, 'assets'),
    dstDir: path.join(distDir, 'assets'),
    label: 'assets/',
    options: {
      jpegQuality: 80,
      pngQuality: 75,
      webpQuality: 75,
    },
  });
}

async function optimizePreviewImages(root, distDir) {
  await optimizeRasterDir({
    srcDir: path.join(root, 'assets', 'previews'),
    dstDir: path.join(distDir, 'assets', 'previews'),
    label: 'assets/previews/',
    options: {
      jpegQuality: 80,
      pngQuality: 78,
      webpQuality: 78,
    },
    onError: 'copy',
  });
}

function copyAssets(root, distDir) {
  const assetsToCopy = [
    {
      src: path.join(root, 'assets', 'favicon.png'),
      dst: path.join(distDir, 'assets', 'favicon.png'),
    },
    {
      src: path.join(root, 'assets', 'cv-martinez-joris.pdf'),
      dst: path.join(distDir, 'assets', 'cv-martinez-joris.pdf'),
    },
  ];

  assetsToCopy.forEach(({ src, dst }) => {
    if (!fs.existsSync(src)) {
      log(`Optionnel absent: ${path.relative(root, src)}`, 'warning');
      return;
    }
    if (fs.statSync(src).isDirectory()) {
      copyDirRecursive(src, dst);
    } else {
      copyFile(src, dst);
    }
  });

  log('Assets (previews, favicon) copiés', 'success');
}

module.exports = {
  optimizeImages,
  optimizePreviewImages,
  copyAssets,
};
