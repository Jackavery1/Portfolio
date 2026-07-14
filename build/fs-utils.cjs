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

function prepareStagingDir(stagingDir) {
  if (!fs.existsSync(stagingDir)) {
    ensureDir(stagingDir);
    return;
  }

  const repli = `${stagingDir}.old`;
  try {
    if (fs.existsSync(repli)) {
      fs.rmSync(repli, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
    fs.renameSync(stagingDir, repli);
  } catch {
    try {
      fs.rmSync(stagingDir, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 300,
      });
    } catch (err) {
      log(`Staging verrouillé (${err.message}) — écrasement fichier par fichier`, 'warning');
      viderRepertoire(stagingDir);
    }
  }

  ensureDir(stagingDir);
}

function viderRepertoire(dirPath) {
  for (const entree of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolu = path.join(dirPath, entree.name);
    if (entree.isDirectory()) {
      viderRepertoire(absolu);
      try {
        fs.rmdirSync(absolu);
      } catch {
        /* répertoire encore verrouillé */
      }
      continue;
    }
    try {
      fs.unlinkSync(absolu);
    } catch {
      /* fichier encore verrouillé — écrasé au prochain copyFile */
    }
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

// Copie staging → dist : plus fiable qu’un rename quand dist/ est verrouillé (Windows).
function finalizeDist(stagingDir, distDir) {
  ensureDir(distDir);
  copyDirRecursive(stagingDir, distDir);
  log('dist/ synchronisé depuis le staging');
}

function createDist(stagingDir) {
  prepareStagingDir(stagingDir);
  log('Dossier de build préparé');
}

/** Remplace le staging servi par un build frais (rename atomique, repli copie sous Windows). */
function promouvoirStaging(workDir, stagingDir) {
  if (!fs.existsSync(workDir)) {
    throw new Error(`Build introuvable : ${workDir}`);
  }

  const stagingOld = `${stagingDir}.old`;

  const promouvoirParRename = () => {
    if (fs.existsSync(stagingOld)) {
      fs.rmSync(stagingOld, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    }
    if (fs.existsSync(stagingDir)) {
      fs.renameSync(stagingDir, stagingOld);
    }
    fs.renameSync(workDir, stagingDir);
    try {
      fs.rmSync(stagingOld, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
    } catch {
      log(`Ancien staging conservé dans ${path.basename(stagingOld)}`, 'warning');
    }
  };

  try {
    promouvoirParRename();
    log(`${path.basename(stagingDir)}/ promu depuis le build`);
    return true;
  } catch (err) {
    log(`Promotion par rename impossible (${err.message}) — copie fichier par fichier`, 'warning');
  }

  ensureDir(stagingDir);
  const echecs = copyDirRecursive(workDir, stagingDir, { tolererEchecs: true });
  if (echecs.length === 0) {
    try {
      fs.rmSync(workDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      log(`Répertoire de build ${path.basename(workDir)}/ non supprimé`, 'warning');
    }
    log(`${path.basename(stagingDir)}/ synchronisé depuis le build`);
    return true;
  }

  log(
    `${path.basename(stagingDir)}/ partiellement synchronisé — artefact complet dans ${path.basename(workDir)}/`,
    'warning'
  );
  return false;
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
  promouvoirStaging,
  ecrireFichierTexte,
};
