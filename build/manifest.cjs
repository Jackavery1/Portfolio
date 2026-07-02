const fs = require('fs');
const path = require('path');
const { ensureDir, log } = require('./fs-utils.cjs');
const { person } = require('./config-defaults.cjs');

function buildManifest(siteBase) {
  const base = siteBase.endsWith('/') ? siteBase : `${siteBase}/`;
  return {
    name: person.siteName,
    short_name: 'Portfolio',
    description: `${person.jobTitle} — portfolio personnel`,
    start_url: `${base}index.html`,
    scope: base,
    display: 'standalone',
    background_color: '#03040f',
    theme_color: '#03040f',
    lang: 'fr-FR',
    orientation: 'any',
    icons: [
      {
        src: `${base}assets/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${base}assets/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${base}assets/apple-touch-icon.png`,
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${base}assets/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

function writeManifest(distDir, siteBase) {
  ensureDir(distDir);
  const contenu = `${JSON.stringify(buildManifest(siteBase), null, 2)}\n`;
  fs.writeFileSync(path.join(distDir, 'manifest.webmanifest'), contenu, 'utf8');
  log('manifest.webmanifest généré', 'success');
}

module.exports = { buildManifest, writeManifest };
