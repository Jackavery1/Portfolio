import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-legal', () => {
  it('génère legal-data.js depuis legal.json', () => {
    const { syncLegal } = require('./sync-legal.cjs');
    syncLegal();

    const target = path.join(rootDir, 'js', 'config', 'legal-data.js');
    expect(fs.existsSync(target)).toBe(true);

    const contenu = fs.readFileSync(target, 'utf8');
    expect(contenu).toContain('export const LEGAL');
    expect(contenu).toContain('donnees-personnelles');
  });
});
