import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import {
  balisesPageMeta,
  blocPageMeta,
  escapeHtmlAttr,
  remplacerBlocPageMeta,
} from './page-meta-tags.cjs';

const require = createRequire(import.meta.url);
const { PAGE_META } = require('./page-meta.cjs');
const { HTML_FILES } = require('./html.cjs');

describe('page-meta-tags', () => {
  it('génère les balises meta pour chaque page', () => {
    HTML_FILES.forEach((file) => {
      const meta = PAGE_META[file];
      expect(meta).toBeTruthy();
      const balises = balisesPageMeta(meta);
      expect(balises).toContain('name="description"');
      expect(balises).toContain('property="og:title"');
      expect(balises).toContain('name="twitter:title"');
    });
  });

  it('remplace le bloc PAGE_META dans le HTML', () => {
    const meta = PAGE_META['projets.html'];
    const source = `<head>
    <!-- PAGE_META_START -->
    old
    <!-- PAGE_META_END -->
    <title>Projets</title>
  </head>`;
    const out = remplacerBlocPageMeta(source, meta);
    expect(out).toContain('property="og:title" content="Projets · Joris Martinez"');
    expect(out).not.toContain('old');
  });

  it('blocPageMeta inclut les marqueurs', () => {
    const bloc = blocPageMeta(PAGE_META['index.html']);
    expect(bloc).toContain('<!-- PAGE_META_START -->');
    expect(bloc).toContain('<!-- PAGE_META_END -->');
  });

  it('escapeHtmlAttr échappe & et les guillemets', () => {
    expect(escapeHtmlAttr('A & B "test"')).toBe('A &amp; B &quot;test&quot;');
  });

  it('balisesPageMeta retourne une chaîne vide sans meta', () => {
    expect(balisesPageMeta(null)).toBe('');
    expect(blocPageMeta(null)).toBe('');
  });

  it('metaTag multiligne pour les descriptions longues', () => {
    const meta = {
      description: 'x'.repeat(120),
      ogTitle: 'Titre',
      ogDescription: 'Court',
      twitterTitle: 'Titre',
      twitterDescription: 'Court',
    };
    const balises = balisesPageMeta(meta);
    expect(balises).toContain('<meta\n');
    expect(balises).toContain('name="description"');
  });

  it('remplacerBlocPageMeta laisse le HTML inchangé sans marqueurs PAGE_META', () => {
    const source = '<head><title>Sans meta</title></head>';
    expect(remplacerBlocPageMeta(source, PAGE_META['index.html'])).toBe(source);
  });
});
