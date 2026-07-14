import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mobile = require('../lighthouserc.cjs');
const { HTML_FILES } = require('./html-files.cjs');

describe('lighthouserc', () => {
  it('audit mobile — URLs .html (express.static LHCI, pas de redirect)', () => {
    mobile.ci.collect.url.forEach((url) => {
      expect(url).toMatch(/\.html$/);
    });
  });

  it('audit les pages HTML_FILES plus offline.html', () => {
    expect(mobile.ci.collect.url).toEqual([...HTML_FILES, 'offline.html']);
  });

  it('staticDistDir cible un artefact build connu', () => {
    expect(mobile.ci.collect.staticDistDir).toMatch(/^\.\/\.dist-staging(-build)?$/);
  });

  it('lighthouserc desktop partage la résolution staticDistDir', () => {
    const desktop = require('../lighthouserc.desktop.cjs');
    expect(desktop.ci.collect.staticDistDir).toBe(mobile.ci.collect.staticDistDir);
  });
});
