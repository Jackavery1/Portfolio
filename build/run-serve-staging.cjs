const path = require('path');
const { spawnSync } = require('child_process');
const { resolveServeDir } = require('./resolve-serve-dir.cjs');

function runServeStaging({ root = path.join(__dirname, '..'), port = '3000', spawn = spawnSync } = {}) {
  const dir = resolveServeDir(root);
  if (!dir) {
    return { ok: false, code: 1, dir: null };
  }

  const result = spawn('npx', ['serve', dir, '-l', port], {
    stdio: 'inherit',
    shell: true,
    cwd: root,
  });

  return { ok: true, code: result.status ?? 1, dir };
}

if (require.main === module) {
  const port = process.argv[2] || '3000';
  const outcome = runServeStaging({ port });
  if (!outcome.ok) {
    console.error('Répertoire de serve introuvable (.dist-staging-build/ ou .dist-staging/)');
    process.exit(1);
  }
  process.exit(outcome.code);
}

module.exports = { runServeStaging };
