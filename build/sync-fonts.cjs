const path = require('path');
const { syncFontsRoot } = require('./fonts.cjs');

const ROOT = path.join(__dirname, '..');

function syncFonts(root = ROOT) {
  syncFontsRoot(root);
}

module.exports = { syncFonts, ROOT };

if (require.main === module) {
  syncFonts();
}
