const fs = require('fs');
const path = require('path');

function resolveServeDir(root = path.join(__dirname, '..')) {
  const work = path.join(root, '.dist-staging-build');
  const staging = path.join(root, '.dist-staging');
  if (fs.existsSync(work)) return work;
  if (fs.existsSync(staging)) return staging;
  return null;
}

module.exports = { resolveServeDir };

if (require.main === module) {
  const dir = resolveServeDir();
  if (!dir) {
    process.stderr.write('Aucun répertoire de build trouvé.\n');
    process.exit(1);
  }
  process.stdout.write(dir);
}
