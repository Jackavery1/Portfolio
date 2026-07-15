import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { HTML_FILES } = require('./html.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const FICHIERS_SAFE_AREA = [
  'styles/reset.css',
  'styles/layout/marquee.css',
  'styles/layout/ecran.css',
  'styles/layout/utilities.css',
  'styles/components/nav/base.css',
  'styles/components/modal/overlay.css',
  'styles/components/modal/highscore.css',
  'styles/pages/offline.css',
];

const FICHIERS_SCROLL_TACTILE = [
  'styles/components/modal/overlay.css',
  'styles/components/modal/responsive.css',
  'styles/components/form.css',
  'styles/pages/competences/layout.css',
  'styles/pages/parcours/responsive-mobile.css',
];

function lire(rel) {
  return fs.readFileSync(path.join(rootDir, rel), 'utf8');
}

describe('responsive CSS', () => {
  it('viewport-fit=cover sur toutes les pages HTML', () => {
    HTML_FILES.forEach((file) => {
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

  it('marquee, nav, écran et contact — safe-area testable via custom property', () => {
    const fichiers = [
      'styles/layout/marquee.css',
      'styles/components/nav/base.css',
      'styles/layout/ecran.css',
      'styles/pages/contact/responsive-mobile.css',
      'styles/pages/mentions-legales/responsive-mobile.css',
    ];
    fichiers.forEach((fichier) => {
      const contenu = lire(fichier);
      expect(contenu, fichier).toContain('var(--safe-area-inset');
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

  it('transition data-app-ready sur la coquille .ecran', () => {
    const contenu = lire('styles/layout/utilities.css');
    expect(contenu).toContain("body:not([data-app-ready='true']) .ecran");
    expect(contenu).toContain("body[data-app-ready='true'] .ecran");
    expect(contenu).toContain('prefers-reduced-motion');
  });

  it('section — animation LCP sans fade opacity', () => {
    const contenu = lire('styles/layout/ecran.css');
    const blocSection = contenu.match(/@keyframes apparition-section\s*\{[^}]+\}/)?.[0] ?? '';
    expect(contenu).toContain('animation: apparition-section');
    expect(blocSection).toContain('transform: translateY(6px)');
    expect(blocSection).not.toContain('opacity');
  });

  it('projets et parcours ont des modules responsive dédiés', () => {
    const { PROJETS_STYLE_SOURCES, PARCOURS_STYLE_SOURCES } = require('./page-styles.mjs');
    expect(PROJETS_STYLE_SOURCES.some((f) => f.includes('responsive'))).toBe(true);
    expect(PARCOURS_STYLE_SOURCES.some((f) => f.includes('responsive'))).toBe(true);
    expect(PARCOURS_STYLE_SOURCES).toContain('styles/pages/parcours/responsive-mobile.css');
    expect(PARCOURS_STYLE_SOURCES).toContain('styles/pages/parcours/responsive-tablette.css');
  });

  it('indicateur de scroll horizontal sur zones défilantes denses', () => {
    expect(lire('styles/pages/competences/layout.css')).toContain('.scores-tableau-zone::after');
    expect(lire('styles/pages/parcours/responsive-mobile.css')).toContain('.story-arbre::after');
  });

  it('squelettes et hint paysage diffèrent le rendu pour le LCP', () => {
    expect(lire('styles/components/partial-squelette.css')).toContain('content-visibility: auto');
    expect(lire('styles/components/hint-paysage.css')).toContain('content-visibility: auto');
  });
});
