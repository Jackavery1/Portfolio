const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const { applyBuildEnvToJs } = require('./env.cjs');
const { ensureDir, copyFile, walkJsFiles, log } = require('./fs-utils.cjs');

function copyJsonConfig(root, distDir) {
  const configDir = path.join(root, 'js', 'config');
  if (!fs.existsSync(configDir)) return;

  const jsonFiles = fs.readdirSync(configDir).filter((name) => name.endsWith('.json'));
  if (jsonFiles.length === 0) return;

  const dstConfigDir = path.join(distDir, 'js', 'config');
  jsonFiles.forEach((name) => {
    copyFile(path.join(configDir, name), path.join(dstConfigDir, name));
  });
  log(`${jsonFiles.length} fichier(s) JSON config copié(s)`, 'success');
}

function minifyAllJs(root, distDir) {
  const jsRoot = path.join(root, 'js');
  const dstRoot = path.join(distDir, 'js');
  if (!fs.existsSync(jsRoot)) {
    log('Dossier js/ non trouvé', 'warning');
    return;
  }

  const files = walkJsFiles(jsRoot);
  let totalIn = 0;
  let totalOut = 0;
  const uglifyErrors = [];

  files.forEach((absSrc) => {
    const rel = path.relative(jsRoot, absSrc);
    let input = fs.readFileSync(absSrc, 'utf8');
    const relNorm = rel.replace(/\\/g, '/');
    if (relNorm === 'config.js' || relNorm.startsWith('config/')) {
      input = applyBuildEnvToJs(input);
    }
    const result = UglifyJS.minify(
      { [rel]: input },
      {
        parse: { module: true },
        compress: { module: true, passes: 2 },
        mangle: true,
        output: { comments: false },
        module: true,
      }
    );

    if (result.error) {
      uglifyErrors.push(`${rel}: ${result.error.message}`);
      return;
    }

    const dst = path.join(dstRoot, rel);
    ensureDir(path.dirname(dst));
    fs.writeFileSync(dst, result.code);
    totalIn += input.length;
    totalOut += result.code.length;
  });

  if (uglifyErrors.length) {
    uglifyErrors.forEach((m) => log(m, 'error'));
    throw new Error('UglifyJS a échoué sur un ou plusieurs fichiers');
  }

  if (files.length === 0) {
    log('Aucun .js sous js/', 'warning');
    return;
  }
  const savings = ((1 - totalOut / totalIn) * 100).toFixed(1);
  log(
    `${files.length} module(s) JS minifié(s): ${totalIn} → ${totalOut} octets (-${savings}%)`,
    'success'
  );
  copyJsonConfig(root, distDir);
}

module.exports = { minifyAllJs, copyJsonConfig };
