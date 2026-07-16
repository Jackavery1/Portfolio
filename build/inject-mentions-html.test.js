import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const {
  injectMentionsHtml,
  genererSommaire,
  genererSections,
} = require('./inject-mentions-html.cjs');

describe('inject-mentions-html', () => {
  it('injecte sommaire et sections statiques dans le HTML', () => {
    const source = fs.readFileSync(path.join(rootDir, 'mentions-legales.html'), 'utf8');
    const out = injectMentionsHtml(source, rootDir);

    expect(out).toContain('class="mentions-sommaire"');
    expect(out).toContain('id="donnees-personnelles"');
    expect(out).toContain('id="js-mentions-email"');
    expect(out).toMatch(/href="mailto:[^"]+"/);
    expect(out).not.toContain('partial-squelette__ligne');
    expect(out).toContain('aria-busy="false"');
    expect(out).toMatch(/<div id="js-mentions-sections" aria-live="polite" aria-busy="false">/);
  });

  it('retourne le HTML inchangé si legal.json est absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mentions-sans-legal-'));
    const html = '<div id="js-mentions-sections"></div>';
    expect(injectMentionsHtml(html, tmp)).toBe(html);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('génère un sommaire et un éditeur sans email', () => {
    const sommaire = genererSommaire([{ id: 'editeur', title: 'Éditeur' }]);
    expect(sommaire).toContain('href="#editeur"');
    expect(sommaire).toContain('Éditeur');

    const sections = genererSections(
      {
        sections: [
          {
            id: 'editeur',
            title: 'Éditeur',
            blocks: [{ type: 'editor' }],
          },
          {
            id: 'autre',
            title: 'Autre',
            intro: 'Intro',
            paragraphs: ['Texte'],
          },
        ],
      },
      'Nom Test',
      ''
    );
    expect(sections).toContain('href="#"');
    expect(sections).toContain('hidden');
    expect(sections).toContain('Nom Test');
    expect(sections).toContain('Intro');
    expect(sections).toContain('Texte');
  });

  it('génère subsections avec liste et section sans id', () => {
    const sections = genererSections(
      {
        sections: [
          {
            title: 'Sans id',
            blocks: [{ type: 'autre' }],
            subsections: [
              {
                title: 'Sous',
                paragraphs: ['Para'],
                list: ['Item A', 'Item B'],
              },
            ],
          },
        ],
      },
      'Nom',
      'a@b.c'
    );
    expect(sections).toContain('class="mentions-bloc"');
    expect(sections).not.toContain(' id="');
    expect(sections).toContain('<ul><li>Item A</li><li>Item B</li></ul>');
    expect(sections).toContain('Para');
  });
});
