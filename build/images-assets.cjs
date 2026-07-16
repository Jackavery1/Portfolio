const fs = require('fs');
const path = require('path');
const { log } = require('./fs-utils.cjs');

function attacherApiAssets(api) {
  api.copyAssets = function copyAssets(root, distDir) {
    const {
      copyDirRecursive: copierRepertoire,
      copyFile: copierFichier,
    } = require('./fs-utils.cjs');
    const assetsToCopy = [
      {
        src: path.join(root, 'assets', 'favicon.png'),
        dst: path.join(distDir, 'assets', 'favicon.png'),
      },
      {
        src: path.join(root, 'assets', 'apple-touch-icon.png'),
        dst: path.join(distDir, 'assets', 'apple-touch-icon.png'),
      },
      {
        src: path.join(root, 'assets', 'icon-192.png'),
        dst: path.join(distDir, 'assets', 'icon-192.png'),
      },
      {
        src: path.join(root, 'assets', 'icon-512.png'),
        dst: path.join(distDir, 'assets', 'icon-512.png'),
      },
      {
        src: path.join(root, 'offline.html'),
        dst: path.join(distDir, 'offline.html'),
      },
    ];

    assetsToCopy.forEach(({ src, dst }) => {
      if (!fs.existsSync(src)) {
        log(`Optionnel absent: ${path.relative(root, src)}`, 'warning');
        return;
      }
      if (fs.statSync(src).isDirectory()) {
        copierRepertoire(src, dst);
      } else {
        copierFichier(src, dst);
      }
    });

    const offlineDst = path.join(distDir, 'offline.html');
    if (fs.existsSync(offlineDst)) {
      const stats = fs.statSync(offlineDst);
      const estFichier = typeof stats.isFile === 'function' ? stats.isFile() : !stats.isDirectory();
      if (estFichier) {
        const { reecrireLiensStylesOffline } = require('./page-styles.mjs');
        const html = fs.readFileSync(offlineDst, 'utf8');
        fs.writeFileSync(offlineDst, reecrireLiensStylesOffline(html), 'utf8');
      }
    }

    log('Assets (previews, favicon) copiés', 'success');
  };
}

module.exports = { attacherApiAssets };
