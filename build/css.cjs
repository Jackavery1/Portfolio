const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const { ensureDir, log } = require('./fs-utils.cjs');
const {
  BASE_STYLE_FILE,
  BASE_STYLE_SOURCES_PROD,
  PAGE_STYLE_BY_HTML,
  sourcesVersImports,
} = require('./page-styles.mjs');

function minifierBundle(root, cssText, label) {
  const result = new CleanCSS({
    level: 2,
    relativeTo: root,
    rebaseTo: root,
    inline: ['local'],
  }).minify({ 'bundle.css': { styles: cssText } });

  if (result.errors?.length) {
    throw new Error(`CleanCSS (${label}): ${result.errors.join(', ')}`);
  }

  return result.styles;
}

function ecrireCss(distDir, filename, contenu, label) {
  const dstFile = path.join(distDir, filename);
  ensureDir(path.dirname(dstFile));
  fs.writeFileSync(dstFile, contenu);
  log(`${label} → ${filename} (${contenu.length} octets)`, 'success');
}

function minifyCSS(root, distDir, options = {}) {
  const { inclureMonolithe = true } = options;
  const srcMonolith = path.join(root, 'style.css');
  if (!fs.existsSync(srcMonolith)) {
    log(`CSS source non trouvé: ${srcMonolith}`, 'warning');
    return;
  }

  const baseInput = sourcesVersImports(BASE_STYLE_SOURCES_PROD);
  const baseOutput = minifierBundle(root, baseInput, 'style-base');
  ecrireCss(distDir, BASE_STYLE_FILE, baseOutput, 'CSS base');

  Object.values(PAGE_STYLE_BY_HTML).forEach(({ outfile, sources }) => {
    const pageInput = sourcesVersImports(sources);
    const pageOutput = minifierBundle(root, pageInput, outfile);
    ecrireCss(distDir, outfile, pageOutput, 'CSS page');
  });

  if (inclureMonolithe) {
    const monolithInput = fs.readFileSync(srcMonolith, 'utf8');
    const monolithOutput = minifierBundle(root, monolithInput, 'style.css (dev fallback)');
    ecrireCss(distDir, 'style.css', monolithOutput, 'CSS monolithique (fallback)');
  }
}

module.exports = { minifyCSS };
