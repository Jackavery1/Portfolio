import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const requireFromBuild = createRequire(import.meta.url);

/** Charge un module CJS du dossier build/ (`env.cjs` ou `./env.cjs`). */
export function loadBuild(relativePath) {
  const normalized = relativePath.replace(/^\.\//, '');
  return requireFromBuild(path.join(buildDir, normalized));
}

export const repoRoot = path.join(buildDir, '..');
