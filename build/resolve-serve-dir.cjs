const fs = require('fs');
const path = require('path');

function resolveServeDir(root = path.join(__dirname, '..')) {
  const work = path.join(root, '.dist-staging-build');
  const staging = path.join(root, '.dist-staging');
  if (fs.existsSync(work)) return work;
  if (fs.existsSync(staging)) return staging;
  return null;
}

function executerResolveServeDirCli({
  root = path.join(__dirname, '..'),
  stdout = process.stdout,
  stderr = process.stderr,
  exit = process.exit,
} = {}) {
  const dir = resolveServeDir(root);
  if (!dir) {
    stderr.write('Aucun répertoire de build trouvé.\n');
    exit(1);
    return { ok: false, dir: null };
  }
  stdout.write(dir);
  return { ok: true, dir };
}

module.exports = { resolveServeDir, executerResolveServeDirCli };

if (require.main === module) {
  executerResolveServeDirCli();
}
