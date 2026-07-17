import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HTML_FILES } from './html-files.mjs';
import { PAGE_META } from './page-meta.mjs';
import { PAGE_STYLE_BY_HTML } from './page-styles.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('extension pages — contrat registre', () => {
  it('chaque HTML_FILES a PAGE_META + PAGE_STYLE_BY_HTML', () => {
    HTML_FILES.forEach((fichier) => {
      expect(PAGE_META[fichier], `PAGE_META manquant : ${fichier}`).toBeDefined();
      expect(PAGE_STYLE_BY_HTML[fichier], `PAGE_STYLE_BY_HTML manquant : ${fichier}`).toBeDefined();
    });
  });

  it('chaque HTML_FILES est listé dans e2e/fixtures/pages.js', async () => {
    const fixturesUrl = pathToFileURL(path.join(root, 'e2e', 'fixtures', 'pages.js')).href;
    const { PAGES } = await import(fixturesUrl);
    const fichiersE2e = new Set(PAGES.map((p) => p.fichier));
    HTML_FILES.forEach((fichier) => {
      expect(fichiersE2e.has(fichier), `fixture e2e manquante : ${fichier}`).toBe(true);
    });
  });
});
