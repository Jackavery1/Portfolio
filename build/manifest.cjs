const path = require('path');
const { log } = require('./fs-utils.cjs');
const { person } = require('./config-defaults.mjs');

function buildManifest(siteBase) {
  const base = siteBase.endsWith('/') ? siteBase : `${siteBase}/`;
  return {
    name: person.siteName,
    short_name: 'Portfolio',
    description: `${person.jobTitle} — portfolio personnel`,
    start_url: `${base}index.html`,
    scope: base,
    display: 'standalone',
    background_color: '#03040f', // = --couleur-fond (tokens.css)
    theme_color: '#03040f', // = meta theme-color / --couleur-fond
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

function buildDevManifest() {
  const icon = (src, sizes, purpose = 'any') => ({
    src,
    sizes,
    type: 'image/png',
    purpose,
  });

  return {
    name: person.siteName,
    short_name: 'Portfolio',
    description: `${person.jobTitle} — portfolio personnel`,
    start_url: './index.html',
    scope: './',
    display: 'standalone',
    background_color: '#03040f', // = --couleur-fond (tokens.css)
    theme_color: '#03040f', // = meta theme-color / --couleur-fond
    lang: 'fr-FR',
    orientation: 'any',
    icons: [
      icon('./assets/icon-192.png', '192x192'),
      icon('./assets/icon-512.png', '512x512'),
      icon('./assets/apple-touch-icon.png', '180x180'),
      icon('./assets/icon-512.png', '512x512', 'maskable'),
    ],
  };
}

function writeManifest(distDir, siteBase) {
  const { ecrireFichierTexte } = require('./fs-utils.cjs');
  const contenu = `${JSON.stringify(buildManifest(siteBase), null, 2)}\n`;
  ecrireFichierTexte(path.join(distDir, 'manifest.webmanifest'), contenu);
  log('manifest.webmanifest généré', 'success');
}

module.exports = { buildManifest, buildDevManifest, writeManifest };
