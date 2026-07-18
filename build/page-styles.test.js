import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const {
  ACCUEIL_STYLE_SOURCES,
  BASE_STYLE_SOURCES,
  BASE_STYLE_SOURCES_PROD,
  LAYOUT_STYLE_SOURCES,
  MODAL_STYLE_SOURCES,
  PAGE_STYLE_BY_HTML,
} = require('./page-styles.mjs');

describe('page-styles', () => {
  it('chaque source CSS référencée existe sur disque', () => {
    const sources = [
      ...BASE_STYLE_SOURCES,
      ...Object.values(PAGE_STYLE_BY_HTML).flatMap(({ sources: s }) => s),
    ];

    sources.forEach((rel) => {
      expect(fs.existsSync(path.join(rootDir, rel)), rel).toBe(true);
    });
  });

  it('BASE_STYLE_SOURCES_PROD est aligné sur la base (sans bandeau dev)', () => {
    expect(BASE_STYLE_SOURCES_PROD).toEqual(BASE_STYLE_SOURCES);
    expect(BASE_STYLE_SOURCES_PROD).not.toContain('styles/components/dev-banner.css');
  });

  it('accueil est découpé en modules dédiés', () => {
    expect(ACCUEIL_STYLE_SOURCES).toHaveLength(9);
    expect(ACCUEIL_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/accueil/'))).toBe(true);
  });

  it('layout est découpé en modules dédiés', () => {
    expect(LAYOUT_STYLE_SOURCES).toHaveLength(4);
    expect(LAYOUT_STYLE_SOURCES.every((s) => s.startsWith('styles/layout/'))).toBe(true);
  });

  it('modale découpée en modules dédiés', () => {
    expect(MODAL_STYLE_SOURCES).toHaveLength(3);
    expect(MODAL_STYLE_SOURCES.every((s) => s.startsWith('styles/components/modal/'))).toBe(true);
  });

  it('contact et dojo sont découpés en modules dédiés', () => {
    const { CONTACT_STYLE_SOURCES, DOJO_STYLE_SOURCES } = require('./page-styles.mjs');
    expect(CONTACT_STYLE_SOURCES).toContain('styles/components/form.css');
    expect(CONTACT_STYLE_SOURCES.filter((s) => s.startsWith('styles/pages/contact/'))).toHaveLength(
      5
    );
    expect(DOJO_STYLE_SOURCES).toHaveLength(5);
    expect(DOJO_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/dojo/'))).toBe(true);
  });

  it('formulaire CSS n’est pas dans le bundle base', () => {
    expect(BASE_STYLE_SOURCES).not.toContain('styles/components/form.css');
  });

  it('compétences est découpé en modules dédiés', () => {
    const { COMPETENCES_STYLE_SOURCES } = require('./page-styles.mjs');
    expect(COMPETENCES_STYLE_SOURCES).toHaveLength(7);
    expect(COMPETENCES_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/competences/'))).toBe(
      true
    );
  });

  it('nav est découpé en modules dédiés', () => {
    const { NAV_STYLE_SOURCES } = require('./page-styles.mjs');
    expect(NAV_STYLE_SOURCES).toHaveLength(6);
    expect(NAV_STYLE_SOURCES.filter((s) => s.startsWith('styles/components/nav/'))).toHaveLength(5);
    expect(NAV_STYLE_SOURCES).toContain('styles/components/konami.css');
  });

  it('mentions légales est découpé en modules dédiés', () => {
    const { MENTIONS_LEGALES_STYLE_SOURCES } = require('./page-styles.mjs');
    expect(MENTIONS_LEGALES_STYLE_SOURCES).toHaveLength(2);
    expect(
      MENTIONS_LEGALES_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/mentions-legales/'))
    ).toBe(true);
  });

  it('projets et parcours sont découpés en modules dédiés', () => {
    const { PROJETS_STYLE_SOURCES, PARCOURS_STYLE_SOURCES } = require('./page-styles.mjs');
    expect(PROJETS_STYLE_SOURCES).toHaveLength(3);
    expect(PROJETS_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/projets/'))).toBe(true);
    expect(PARCOURS_STYLE_SOURCES).toHaveLength(4);
    expect(PARCOURS_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/parcours/'))).toBe(true);
  });

  it('bouton pixel est un composant partagé du bundle base', () => {
    expect(BASE_STYLE_SOURCES).toContain('styles/components/bouton-pixel.css');
  });

  it('aucun fichier CSS source orphelin sous styles/', () => {
    const { allMonolithSources, OFFLINE_STYLE_SOURCES } = require('./page-styles.mjs');
    const references = new Set([...allMonolithSources(), ...OFFLINE_STYLE_SOURCES]);

    function listerCss(dir, acc = []) {
      for (const entree of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolu = path.join(dir, entree.name);
        if (entree.isDirectory()) listerCss(absolu, acc);
        else if (entree.name.endsWith('.css'))
          acc.push(path.relative(rootDir, absolu).replace(/\\/g, '/'));
      }
      return acc;
    }

    const orphelins = listerCss(path.join(rootDir, 'styles')).filter((rel) => !references.has(rel));
    expect(orphelins, orphelins.join(', ')).toEqual([]);
  });

  it('offline bundle inclut tokens et police locale', () => {
    const {
      OFFLINE_STYLE_SOURCES,
      OFFLINE_STYLE_FILE,
      reecrireLiensStylesOffline,
    } = require('./page-styles.mjs');
    expect(OFFLINE_STYLE_FILE).toBe('style-page-offline.css');
    expect(OFFLINE_STYLE_SOURCES).toEqual([
      'styles/tokens.css',
      'styles/fonts-local.css',
      'styles/pages/offline.css',
    ]);
    const html = reecrireLiensStylesOffline(`<!doctype html><html><head>
    <link rel="stylesheet" href="styles/tokens.css" />
    <link rel="stylesheet" href="styles/fonts-local.css" />
    <link rel="stylesheet" href="styles/pages/offline.css" />
    <title>Hors ligne</title>
  </head></html>`);
    expect(html).toContain('href="style-page-offline.css"');
    expect(html).not.toContain('styles/tokens.css');
    expect(html).not.toContain('styles/pages/offline.css');
  });
});
