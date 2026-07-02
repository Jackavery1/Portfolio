import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FICHIERS_SAFE_AREA = [
  'styles/reset.css',
  'styles/layout/marquee.css',
  'styles/layout/ecran.css',
  'styles/layout/utilities.css',
  'styles/components/nav.css',
  'styles/components/modal/overlay.css',
  'styles/components/modal/highscore.css',
  'styles/components/crt.css',
  'offline.html',
];

const FICHIERS_SCROLL_TACTILE = [
  'styles/components/modal/overlay.css',
  'styles/components/modal/responsive.css',
  'styles/components/form.css',
  'styles/pages/competences.css',
  'styles/pages/parcours.css',
];

function lire(rel) {
  return fs.readFileSync(path.join(rootDir, rel), 'utf8');
}

describe('responsive CSS', () => {
  it('viewport-fit=cover sur toutes les pages HTML', () => {
    const pages = fs.readdirSync(rootDir).filter((name) => name.endsWith('.html'));

    pages.forEach((file) => {
      const html = lire(file);
      expect(html, file).toMatch(/viewport-fit=cover/);
    });
  });

  it('safe-area sur nav, layout, modale et offline', () => {
    FICHIERS_SAFE_AREA.forEach((file) => {
      const contenu = lire(file);
      expect(contenu, file).toContain('safe-area-inset');
    });
  });

  it('scroll tactile iOS sur zones défilantes', () => {
    FICHIERS_SCROLL_TACTILE.forEach((file) => {
      const contenu = lire(file);
      if (file.endsWith('form.css')) {
        expect(contenu, file).toContain('scroll-margin-bottom');
        return;
      }
      expect(contenu, file).toContain('-webkit-overflow-scrolling: touch');
    });
  });
});
