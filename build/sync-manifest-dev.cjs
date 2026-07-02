const fs = require('fs');
const path = require('path');
const { buildDevManifest } = require('./manifest.cjs');

function syncManifestDev(root = path.join(__dirname, '..')) {
  const out = path.join(root, 'manifest.webmanifest');
  fs.writeFileSync(out, `${JSON.stringify(buildDevManifest(), null, 2)}\n`, 'utf8');
}

module.exports = { syncManifestDev };
