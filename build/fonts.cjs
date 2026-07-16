const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ensureDir, log } = require('./fs-utils.cjs');
const { POLICES, FONT_FILES } = require('./fonts-data.mjs');

function lireUnicodeParSubset(packageName, root) {
  const jsonPath = path.join(root, 'node_modules', packageName, 'unicode.json');
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function genererFontsLocalCss(root) {
  const lignes = [];

  POLICES.forEach(({ package: pkg }) => {
    const unicode = lireUnicodeParSubset(pkg, root);
    FONT_FILES.filter((f) => f.package === pkg).forEach(({ dst, subset, cssFamily: family }) => {
      const range = unicode[subset];
      if (!range) return;
      lignes.push(`@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  unicode-range: ${range};
  src: url('../assets/fonts/${dst}') format('woff2');
}`);
    });
  });

  const cssPath = path.join(root, 'styles', 'fonts-local.css');
  fs.writeFileSync(cssPath, `${lignes.join('\n\n')}\n`);
  execFileSync(
    process.execPath,
    [require.resolve('prettier/bin/prettier.cjs'), '--write', cssPath],
    {
      cwd: root,
      stdio: 'pipe',
    }
  );
}

function syncFontsRoot(root) {
  const dstDir = path.join(root, 'assets', 'fonts');
  ensureDir(dstDir);

  FONT_FILES.forEach(({ package: pkg, src, dst }) => {
    const from = path.join(root, 'node_modules', pkg, 'files', src);
    const to = path.join(dstDir, dst);

    if (!fs.existsSync(from)) {
      throw new Error(`Police manquante: ${from}`);
    }

    fs.copyFileSync(from, to);
  });

  genererFontsLocalCss(root);
}

function policesLocalesPretes(root) {
  const srcDir = path.join(root, 'assets', 'fonts');
  return FONT_FILES.every(({ dst }) => fs.existsSync(path.join(srcDir, dst)));
}

function copyFonts(root, distDir) {
  if (!policesLocalesPretes(root)) {
    syncFontsRoot(root);
  }
  const srcDir = path.join(root, 'assets', 'fonts');
  const dstDir = path.join(distDir, 'assets', 'fonts');
  ensureDir(dstDir);

  FONT_FILES.forEach(({ dst }) => {
    fs.copyFileSync(path.join(srcDir, dst), path.join(dstDir, dst));
  });

  log('Polices locales → assets/fonts/ (latin + latin-ext)', 'success');
}

module.exports = {
  copyFonts,
  syncFontsRoot,
  genererFontsLocalCss,
  FONT_FILES,
  POLICES,
  policesLocalesPretes,
};
