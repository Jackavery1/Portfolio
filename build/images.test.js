import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { copyAssets } = require('./images.cjs');
const { writeServiceWorker } = require('./sw.cjs');

describe('copy assets', () => {
  it('copie offline.html vers le dist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-assets-'));
    try {
      copyAssets(rootDir, tmp);
      expect(fs.existsSync(path.join(tmp, 'offline.html'))).toBe(true);
      expect(fs.readFileSync(path.join(tmp, 'offline.html'), 'utf8')).toContain('Mode hors ligne');
      expect(fs.readFileSync(path.join(tmp, 'offline.html'), 'utf8')).toContain('js-contenu-offline');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('writeServiceWorker produit sw.js avec precache', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-sw-'));
    try {
      writeServiceWorker(tmp, '1.0.2');
      const source = fs.readFileSync(path.join(tmp, 'sw.js'), 'utf8');
      expect(source).toContain('portfolio-arcade-v1-0-2');
      expect(source).toContain('offline.html');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
