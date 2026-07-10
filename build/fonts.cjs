const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ensureDir, log } = require('./fs-utils.cjs');

const SOUS_ENSEMBLES = ['latin', 'latin-ext'];

const POLICES = [
  {
    package: '@fontsource/press-start-2p',
    base: 'press-start-2p',
    cssFamily: 'Press Start 2P',
  },
  {
    package: '@fontsource/vt323',
    base: 'vt323',
    cssFamily: 'VT323',
  },
  {
    package: '@fontsource/rajdhani',
    base: 'rajdhani',
    cssFamily: 'Rajdhani',
  },
];

function entreesPolices() {
  return POLICES.flatMap(({ package: pkg, base, cssFamily }) =>
    SOUS_ENSEMBLES.map((subset) => ({
      package: pkg,
      src: `${base}-${subset}-400-normal.woff2`,
      dst: `${base}-${subset}-400.woff2`,
      subset,
      cssFamily,
    }))
  );
}

const FONT_FILES = entreesPolices();

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

function copyFonts(root, distDir) {
  syncFontsRoot(root);
  const srcDir = path.join(root, 'assets', 'fonts');
  const dstDir = path.join(distDir, 'assets', 'fonts');
  ensureDir(dstDir);

  FONT_FILES.forEach(({ dst }) => {
    fs.copyFileSync(path.join(srcDir, dst), path.join(dstDir, dst));
  });

  log('Polices locales → assets/fonts/ (latin + latin-ext)', 'success');
}

module.exports = { copyFonts, syncFontsRoot, genererFontsLocalCss, FONT_FILES, POLICES };
