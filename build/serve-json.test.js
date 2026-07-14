import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('artefacts build', () => {
  it('serve.json à la racine désactive cleanUrls pour start:prod', () => {
    const serve = JSON.parse(fs.readFileSync(path.join(rootDir, 'serve.json'), 'utf8'));
    expect(serve.cleanUrls).toBe(false);
  });

  it('build.mjs copie serve.json vers le répertoire de build', () => {
    const build = fs.readFileSync(path.join(rootDir, 'build.mjs'), 'utf8');
    expect(build).toContain("path.join(STAGING_WORK, 'serve.json')");
  });
});
