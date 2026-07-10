import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { INITIALISEURS_SECTION } from './sections.js';
import { CHARGES_SECTION } from './sections-registry.js';
import { SECTIONS_AVEC_INITIALISEUR, TOUTES_LES_SECTIONS } from './sections-manifest.js';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const PAGES_HTML = [
  'index.html',
  'projets.html',
  'competences.html',
  'parcours.html',
  'contact.html',
  'dojo.html',
  'mentions-legales.html',
];

describe('sections-manifest', () => {
  it('aligne le manifeste avec les initialiseurs enregistrés', () => {
    expect(Object.keys(INITIALISEURS_SECTION).sort()).toEqual(
      [...SECTIONS_AVEC_INITIALISEUR].sort()
    );
  });

  it('aligne le registre de charges avec le manifeste', () => {
    expect(Object.keys(CHARGES_SECTION).sort()).toEqual([...SECTIONS_AVEC_INITIALISEUR].sort());
  });

  it('couvre tous les data-section-id des pages HTML', () => {
    const ids = PAGES_HTML.map((fichier) => {
      const html = fs.readFileSync(path.join(rootDir, fichier), 'utf8');
      const match = html.match(/data-section-id=["']([^"']+)["']/);
      expect(match, fichier).toBeTruthy();
      return match[1];
    });
    ids.forEach((id) => {
      expect(TOUTES_LES_SECTIONS).toContain(id);
    });
  });
});
