import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { copyAssets, genererIconeCarreePwa, ZONE_UTILE_PWA } = require('./images.cjs');
const { writeServiceWorker } = require('./sw.cjs');

describe('copy assets', () => {
  it('copie offline.html vers le dist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-assets-'));
    try {
      copyAssets(rootDir, tmp);
      expect(fs.existsSync(path.join(tmp, 'offline.html'))).toBe(true);
      expect(fs.readFileSync(path.join(tmp, 'offline.html'), 'utf8')).toContain('Mode hors ligne');
      expect(fs.readFileSync(path.join(tmp, 'offline.html'), 'utf8')).toContain(
        'js-contenu-offline'
      );
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

  it('génère une icône PWA carrée avec zone utile réduite', async () => {
    const src = path.join(rootDir, 'assets', 'favicon.png');
    const buffer = await genererIconeCarreePwa(src, 192);
    const meta = await sharp(buffer).metadata();
    expect(meta.width).toBe(192);
    expect(meta.height).toBe(192);
    expect(ZONE_UTILE_PWA).toBeLessThan(0.6);
  });
});
