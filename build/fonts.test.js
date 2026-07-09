import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('fonts build', () => {
  beforeAll(() => {
    const { syncFontsRoot } = require('./fonts.cjs');
    syncFontsRoot(rootDir);
  });

  it('copie latin et latin-ext pour chaque police', () => {
    const attendus = [
      'press-start-2p-latin-400.woff2',
      'press-start-2p-latin-ext-400.woff2',
      'vt323-latin-400.woff2',
      'vt323-latin-ext-400.woff2',
      'rajdhani-latin-400.woff2',
      'rajdhani-latin-ext-400.woff2',
    ];
    attendus.forEach((fichier) => {
      expect(fs.existsSync(path.join(rootDir, 'assets', 'fonts', fichier))).toBe(true);
    });
  });

  it('génère fonts-local.css avec unicode-range', () => {
    const css = fs.readFileSync(path.join(rootDir, 'styles', 'fonts-local.css'), 'utf8');
    expect(css).toContain("font-family: 'Rajdhani'");
    expect(css).toContain('unicode-range:');
    expect(css).toContain('rajdhani-latin-ext-400.woff2');
    expect((css.match(/@font-face/g) || []).length).toBe(6);
  });
});
