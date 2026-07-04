import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { HTML_FILES } = require('./sync-nav-squelette.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('nav-squelette sync', () => {
  it('injecte le score arcade dans chaque page HTML', () => {
    const partial = fs.readFileSync(path.join(rootDir, 'partials', 'nav-squelette.html'), 'utf8');
    HTML_FILES.forEach((file) => {
      const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
      expect(html).toContain('id="js-score"');
      expect(html).toContain(partial.trim().slice(0, 40));
    });
  });
});
