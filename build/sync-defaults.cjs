const fs = require('fs');
const path = require('path');
const defaults = require('./config-defaults.cjs');

function syncDefaults() {
  const target = path.join(__dirname, '..', 'js', 'config', 'defaults.js');
  const content = `/* Généré par build/sync-defaults.cjs — ne pas éditer à la main. */
export const SITE_ORIGIN = ${JSON.stringify(defaults.siteOrigin)};
export const FORMSPREE_ENDPOINT = ${JSON.stringify(defaults.formspree)};
export const RECAPTCHA_SITE_KEY = ${JSON.stringify(defaults.recaptcha)};
`;
  fs.writeFileSync(target, content, 'utf8');
}

module.exports = { syncDefaults };

if (require.main === module) {
  syncDefaults();
}
