const path = require('path');
const { syncFontsRoot } = require('./fonts.cjs');

syncFontsRoot(path.join(__dirname, '..'));
