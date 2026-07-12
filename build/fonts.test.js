import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { FONT_FILES } = require('./fonts.cjs');

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

  it('copyFonts évite syncFontsRoot si les polices sont déjà présentes', () => {
    const { copyFonts, policesLocalesPretes } = require('./fonts.cjs');
    expect(policesLocalesPretes(rootDir)).toBe(true);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-fonts-'));
    try {
      copyFonts(rootDir, tmp);
      FONT_FILES.forEach(({ dst }) => {
        expect(fs.existsSync(path.join(tmp, 'assets', 'fonts', dst))).toBe(true);
      });
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
