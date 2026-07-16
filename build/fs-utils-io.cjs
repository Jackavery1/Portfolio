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

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ecrireFichierTexte(cible, contenu, { tentatives = 6, delaiMs = 150 } = {}) {
  ensureDir(path.dirname(cible));
  let derniereErreur;

  for (let essai = 0; essai < tentatives; essai += 1) {
    try {
      if (fs.existsSync(cible)) {
        const fd = fs.openSync(cible, 'w');
        try {
          fs.writeSync(fd, contenu, undefined, 'utf8');
        } finally {
          fs.closeSync(fd);
        }
        return;
      }

      fs.writeFileSync(cible, contenu, 'utf8');
      return;
    } catch (err) {
      derniereErreur = err;
      if (essai < tentatives - 1) {
        const fin = Date.now() + delaiMs;
        while (Date.now() < fin) {
          /* attente active courte entre tentatives */
        }
      }
    }
  }

  throw derniereErreur;
}

function copyFile(src, dst) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dst));
  try {
    fs.copyFileSync(src, dst);
    return true;
  } catch (err) {
    if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err;
  }

  const tmp = `${dst}.portfolio-tmp`;
  fs.copyFileSync(src, tmp);
  try {
    fs.renameSync(tmp, dst);
    return true;
  } catch (err) {
    try {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    if (err.code !== 'EPERM' && err.code !== 'EBUSY') throw err;
  }

  const contenu = fs.readFileSync(src);
  if (contenu.includes(0)) throw new Error(`Fichier verrouillé : ${dst}`);
  ecrireFichierTexte(dst, contenu.toString('utf8'));
  return true;
}

function copyDirRecursive(src, dst, { tolererEchecs = false } = {}) {
  /** @type {string[]} */
  const echecs = [];
  if (!fs.existsSync(src)) return echecs;
  ensureDir(dst);
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    if (fs.statSync(srcPath).isDirectory()) {
      echecs.push(...copyDirRecursive(srcPath, dstPath, { tolererEchecs }));
      return;
    }
    try {
      copyFile(srcPath, dstPath);
    } catch (err) {
      if (!tolererEchecs) throw err;
      echecs.push(dstPath);
      log(`Fichier non mis à jour (${file}) : ${err.message}`, 'warning');
    }
  });
  return echecs;
}

function walkJsFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    if (name === 'test-fixtures') continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkJsFiles(p, acc);
    else if (p.endsWith('.js') && !p.endsWith('.test.js')) acc.push(p);
  }
  return acc;
}

module.exports = {
  log,
  ensureDir,
  copyFile,
  copyDirRecursive,
  walkJsFiles,
  ecrireFichierTexte,
};
