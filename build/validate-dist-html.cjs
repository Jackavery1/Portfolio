const path = require('path');
const { spawnSync } = require('child_process');
const { resolveServeDir } = require('./resolve-serve-dir.cjs');

const root = path.join(__dirname, '..');
const dir = resolveServeDir(root);

if (!dir) {
  console.error('Aucun artefact HTML (.dist-staging-build/ ou .dist-staging/)');
  process.exit(1);
}

const rel = path.relative(root, dir).split(path.sep).join('/');
const result = spawnSync(
  'npx',
  ['html-validate', `${rel}/*.html`, `${rel}/offline.html`],
  { stdio: 'inherit', shell: true, cwd: root }
);

process.exit(result.status ?? 1);
