const fs = require('fs');
const path = require('path');
const { log, ensureDir, copyDirRecursive } = require('./fs-utils-io.cjs');

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

function listerFichiersRelatifs(dir, base = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const rel = path.relative(base, abs).replace(/\\/g, '/');
    if (fs.statSync(abs).isDirectory()) {
      listerFichiersRelatifs(abs, base, acc);
    } else {
      acc.push(rel);
    }
  }
  return acc;
}

function supprimerRepertoiresVides(dir, racine) {
  if (!fs.existsSync(dir) || dir === racine) return;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (fs.statSync(abs).isDirectory()) {
      supprimerRepertoiresVides(abs, racine);
    }
  }
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

/** Retire de dist/ les fichiers absents du staging (évite artefacts fantômes). */
function pruneDistOrphelins(stagingDir, distDir) {
  if (!fs.existsSync(distDir)) return 0;
  const stagingFiles = new Set(listerFichiersRelatifs(stagingDir));
  let n = 0;
  for (const rel of listerFichiersRelatifs(distDir)) {
    if (stagingFiles.has(rel)) continue;
    fs.unlinkSync(path.join(distDir, rel));
    n += 1;
  }
  if (n > 0) {
    for (const name of fs.readdirSync(distDir)) {
      const abs = path.join(distDir, name);
      if (fs.statSync(abs).isDirectory()) {
        supprimerRepertoiresVides(abs, distDir);
      }
    }
    log(`${n} fichier(s) orphelin(s) retirés de dist/`, 'success');
  }
  return n;
}

function finalizeDist(stagingDir, distDir) {
  ensureDir(distDir);
  copyDirRecursive(stagingDir, distDir);
  pruneDistOrphelins(stagingDir, distDir);
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
  prepareStagingDir,
  finalizeDist,
  pruneDistOrphelins,
  createDist,
  promouvoirStaging,
};
