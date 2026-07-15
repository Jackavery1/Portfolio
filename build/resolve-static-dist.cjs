const path = require('path');
const { resolveServeDir } = require('./resolve-serve-dir.cjs');

function resolveStaticDistDir(root = path.join(__dirname, '..')) {
  const absolu = resolveServeDir(root);
  if (!absolu) return './.dist-staging';
  const rel = path.relative(root, absolu).split(path.sep).join('/');
  return `./${rel}`;
}

module.exports = { resolveStaticDistDir };
