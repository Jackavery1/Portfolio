import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { balisesPageMeta, blocPageMeta, remplacerBlocPageMeta } from './page-meta-tags.cjs';

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
});
