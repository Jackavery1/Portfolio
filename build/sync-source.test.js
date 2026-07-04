import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-source', () => {
  it('orchestre les synchronisations attendues', () => {
    const { syncSource } = require('./sync-source.cjs');
    syncSource();

    expect(fs.existsSync(path.join(rootDir, 'js/config/defaults.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/legal-data.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/projects-data.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'js/config/partials.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'style.css'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'manifest.webmanifest'))).toBe(true);
  });
});
