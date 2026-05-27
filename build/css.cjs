const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { ensureDir, log } = require('./fs-utils.cjs');

function minifyCSS(root, distDir) {
  const srcFile = path.join(root, 'style.css');
  const dstFile = path.join(distDir, 'style.css');

  if (!fs.existsSync(srcFile)) {
    log(`CSS source non trouvé: ${srcFile}`, 'warning');
    return;
  }

  const input = fs.readFileSync(srcFile, 'utf8');
  const result = new CleanCSS({
    level: 2,
    relativeTo: root,
    rebaseTo: root,
    inline: ['local'],
  }).minify({ 'style.css': { styles: input } });

  if (result.errors && result.errors.length > 0) {
    log(`Erreurs CleanCSS: ${result.errors.join(', ')}`, 'error');
    return;
  }

  ensureDir(path.dirname(dstFile));
  fs.writeFileSync(dstFile, result.styles);
  const originalSize = input.length;
  const minifiedSize = result.styles.length;
  const ratio = ((minifiedSize / originalSize) * 100).toFixed(1);
  // Avec @import inlinés, le fichier final peut être plus gros que style.css source.
  log(`CSS généré (@import inlinés): ${originalSize} → ${minifiedSize} octets (${ratio}% de la source)`, 'success');
}

module.exports = { minifyCSS };
