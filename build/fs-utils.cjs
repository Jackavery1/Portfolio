const fs = require('fs');
const path = require('path');

function log(msg, type = 'info') {
  const prefix =
    {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
    }[type] || '→';
  console.log(`${prefix} ${msg}`);
}

// Crée un dossier s'il n'existe pas.
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copie un fichier en créant son dossier parent.
function copyFile(src, dst) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  return true;
}

// Copie récursive d'un dossier (fallback simple et lisible).
function copyDirRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  ensureDir(dst);
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      copyFile(srcPath, dstPath);
    }
  });
}

// Liste tous les modules JS source (hors tests).
function walkJsFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkJsFiles(p, acc);
    else if (p.endsWith('.js') && !p.endsWith('.test.js')) acc.push(p);
  }
  return acc;
}

// Prépare un dossier de staging propre pour le build.
function prepareStagingDir(stagingDir) {
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 200,
    });
  }
  ensureDir(stagingDir);
}

// Synchronise le staging vers dist (best-effort sur Windows).
function finalizeDist(stagingDir, distDir) {
  ensureDir(distDir);
  copyDirRecursive(stagingDir, distDir);
  log('dist/ synchronisé depuis le staging');
}

function createDist(stagingDir) {
  prepareStagingDir(stagingDir);
  log('Dossier de build préparé');
}

module.exports = {
  log,
  ensureDir,
  copyFile,
  copyDirRecursive,
  walkJsFiles,
  createDist,
  prepareStagingDir,
  finalizeDist,
};
