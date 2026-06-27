const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');

const FONT_FILES = [
  {
    package: '@fontsource/press-start-2p',
    src: 'press-start-2p-latin-400-normal.woff2',
    dst: 'press-start-2p-latin-400.woff2',
  },
  {
    package: '@fontsource/vt323',
    src: 'vt323-latin-400-normal.woff2',
    dst: 'vt323-latin-400.woff2',
  },
  {
    package: '@fontsource/rajdhani',
    src: 'rajdhani-latin-400-normal.woff2',
    dst: 'rajdhani-latin-400.woff2',
  },
  {
    package: '@fontsource/rajdhani',
    src: 'rajdhani-latin-600-normal.woff2',
    dst: 'rajdhani-latin-600.woff2',
  },
];

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
}

function copyFonts(root, distDir) {
  syncFontsRoot(root);
  const srcDir = path.join(root, 'assets', 'fonts');
  const dstDir = path.join(distDir, 'assets', 'fonts');
  ensureDir(dstDir);

  FONT_FILES.forEach(({ dst }) => {
    fs.copyFileSync(path.join(srcDir, dst), path.join(dstDir, dst));
  });

  log('Polices locales → assets/fonts/', 'success');
}

module.exports = { copyFonts, syncFontsRoot, FONT_FILES };
