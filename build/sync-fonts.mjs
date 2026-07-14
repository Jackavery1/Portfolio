import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { syncFontsRoot } = require('./fonts.cjs');

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function syncFonts(root = ROOT) {
  syncFontsRoot(root);
}

export function runCli(root = ROOT) {
  syncFonts(root);
}

const estPointEntree =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (estPointEntree) {
  runCli();
}
