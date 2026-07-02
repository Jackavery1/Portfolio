import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { syncManifestDev } = require('./sync-manifest-dev.cjs');
const { buildDevManifest } = require('./manifest.cjs');

describe('sync-manifest-dev', () => {
  it('génère manifest.webmanifest à la racine pour le dev local', () => {
    const out = path.join(rootDir, 'manifest.webmanifest');
    if (fs.existsSync(out)) fs.unlinkSync(out);

    syncManifestDev(rootDir);

    expect(fs.existsSync(out)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(out, 'utf8'));
    expect(manifest).toEqual(buildDevManifest());

    fs.unlinkSync(out);
  });
});
