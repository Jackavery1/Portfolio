import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { minifyCSS } = require('./css.cjs');
const { BASE_STYLE_FILE, PAGE_STYLE_BY_HTML } = require('./page-styles.cjs');

describe('build css', () => {
  it('génère le CSS base, par page et le fallback monolithique', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-css-'));
    try {
      minifyCSS(rootDir, tmp);

      expect(fs.existsSync(path.join(tmp, BASE_STYLE_FILE))).toBe(true);
      Object.values(PAGE_STYLE_BY_HTML).forEach(({ outfile }) => {
        expect(fs.existsSync(path.join(tmp, outfile))).toBe(true);
      });
      expect(fs.existsSync(path.join(tmp, 'style.css'))).toBe(true);

      const baseSize = fs.statSync(path.join(tmp, BASE_STYLE_FILE)).size;
      const contactSize = fs.statSync(
        path.join(tmp, PAGE_STYLE_BY_HTML['contact.html'].outfile)
      ).size;
      const monolithSize = fs.statSync(path.join(tmp, 'style.css')).size;

      expect(baseSize + contactSize).toBeLessThan(monolithSize);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
