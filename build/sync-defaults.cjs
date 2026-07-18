const fs = require('fs');
const path = require('path');
const defaults = require('./config-defaults.mjs');
const { executerSiEntreeDirecte } = require('./cli-entry.mjs');

function escapeJsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function syncDefaults() {
  const target = path.join(__dirname, '..', 'js', 'config', 'defaults.js');
  const content = `/* Généré par build/sync-defaults.cjs — ne pas éditer à la main. */
export const SITE_ORIGIN = '${escapeJsString(defaults.siteOrigin)}';
export const PERSON_NAME = '${escapeJsString(defaults.person.name)}';
export const FORMSPREE_ENDPOINT = '${escapeJsString(defaults.formspree)}';
export const RECAPTCHA_SITE_KEY = '${escapeJsString(defaults.recaptcha)}';
export const SOCIAL = {
  GITHUB: '${escapeJsString(defaults.social.github)}',
};
`;
  fs.writeFileSync(target, content, 'utf8');
}

module.exports = { syncDefaults, escapeJsString };

executerSiEntreeDirecte(require.main, module, syncDefaults);
