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

  it('copie le subset latin pour chaque police', () => {
    const attendus = [
      'press-start-2p-latin-400.woff2',
      'vt323-latin-400.woff2',
      'rajdhani-latin-400.woff2',
    ];
    attendus.forEach((fichier) => {
      expect(fs.existsSync(path.join(rootDir, 'assets', 'fonts', fichier))).toBe(true);
    });
    expect(
      fs.existsSync(path.join(rootDir, 'assets', 'fonts', 'rajdhani-latin-ext-400.woff2'))
    ).toBe(false);
  });

  it('génère fonts-local.css avec unicode-range', () => {
    const css = fs.readFileSync(path.join(rootDir, 'styles', 'fonts-local.css'), 'utf8');
    expect(css).toContain("font-family: 'Rajdhani'");
    expect(css).toContain('unicode-range:');
    expect(css).toContain('rajdhani-latin-400.woff2');
    expect(css).not.toContain('latin-ext');
    expect((css.match(/@font-face/g) || []).length).toBe(3);
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

  it('copyFonts resynchronise puis copie si les polices locales manquent', () => {
    const { copyFonts } = require('./fonts.cjs');
    const fontsDir = path.join(rootDir, 'assets', 'fonts');
    const backup = `${fontsDir}.bak-test`;
    const tmpDist = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-fonts-dist-'));
    fs.renameSync(fontsDir, backup);
    try {
      copyFonts(rootDir, tmpDist);
      FONT_FILES.forEach(({ dst }) => {
        expect(fs.existsSync(path.join(tmpDist, 'assets', 'fonts', dst))).toBe(true);
        expect(fs.existsSync(path.join(fontsDir, dst))).toBe(true);
      });
    } finally {
      if (fs.existsSync(fontsDir)) fs.rmSync(fontsDir, { recursive: true, force: true });
      fs.renameSync(backup, fontsDir);
      fs.rmSync(tmpDist, { recursive: true, force: true });
    }
  });

  it('syncFontsRoot échoue si un fichier woff2 est absent', () => {
    const { syncFontsRoot } = require('./fonts.cjs');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-fonts-missing-'));
    try {
      expect(() => syncFontsRoot(tmp)).toThrow(/Police manquante/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('genererFontsLocalCss ignore un subset unicode absent', () => {
    const { genererFontsLocalCss, POLICES } = require('./fonts.cjs');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-fonts-css-'));
    try {
      fs.mkdirSync(path.join(tmp, 'styles'), { recursive: true });
      POLICES.forEach(({ package: pkg }) => {
        const dir = path.join(tmp, 'node_modules', pkg);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(
          path.join(dir, 'unicode.json'),
          JSON.stringify({ latin: 'U+0000-00FF' }),
          'utf8'
        );
      });
      genererFontsLocalCss(tmp);
      const css = fs.readFileSync(path.join(tmp, 'styles', 'fonts-local.css'), 'utf8');
      expect((css.match(/@font-face/g) || []).length).toBe(3);
      expect(css).not.toContain('latin-ext');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
