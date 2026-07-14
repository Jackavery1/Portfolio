import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PAGE_META } = require('./page-meta.mjs');
const { HTML_FILES } = require('./html.cjs');
const CONFIG_DEFAULTS = require('./config-defaults.mjs');

describe('page-meta', () => {
  it('couvre toutes les pages HTML du build', () => {
    HTML_FILES.forEach((fichier) => {
      expect(PAGE_META[fichier], fichier).toBeDefined();
    });
  });

  it('injecte le nom de la personne dans les titres', () => {
    const name = CONFIG_DEFAULTS.person.name;
    expect(PAGE_META['index.html'].ogTitle).toContain(name);
    expect(PAGE_META['contact.html'].description).toContain(name);
  });

  it('fournit description et Open Graph pour chaque page', () => {
    Object.values(PAGE_META).forEach((meta) => {
      expect(meta.description).toBeTruthy();
      expect(meta.ogTitle).toBeTruthy();
      expect(meta.ogDescription).toBeTruthy();
      expect(meta.twitterTitle).toBeTruthy();
      expect(meta.twitterDescription).toBeTruthy();
    });
  });
});
