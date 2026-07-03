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
  LAYOUT_STYLE_SOURCES,
  MODAL_STYLE_SOURCES,
  PAGE_STYLE_BY_HTML,
} = require('./page-styles.cjs');

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
    const { CONTACT_STYLE_SOURCES, DOJO_STYLE_SOURCES } = require('./page-styles.cjs');
    expect(CONTACT_STYLE_SOURCES).toHaveLength(5);
    expect(CONTACT_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/contact/'))).toBe(true);
    expect(DOJO_STYLE_SOURCES).toHaveLength(6);
    expect(DOJO_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/dojo/'))).toBe(true);
  });

  it('compétences est découpé en modules dédiés', () => {
    const { COMPETENCES_STYLE_SOURCES } = require('./page-styles.cjs');
    expect(COMPETENCES_STYLE_SOURCES).toHaveLength(7);
    expect(COMPETENCES_STYLE_SOURCES.every((s) => s.startsWith('styles/pages/competences/'))).toBe(
      true
    );
  });

  it('nav est découpé en modules dédiés', () => {
    const { NAV_STYLE_SOURCES } = require('./page-styles.cjs');
    expect(NAV_STYLE_SOURCES).toHaveLength(4);
    expect(NAV_STYLE_SOURCES.every((s) => s.startsWith('styles/components/nav/'))).toBe(true);
  });
});
