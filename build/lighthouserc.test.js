import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const mobile = require('../lighthouserc.cjs');
const { HTML_FILES } = require('./html-files.mjs');

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

  it('seuils perf pages denses / projets / contact alignés à 0,85 (mobile)', () => {
    const perf = mobile.ci.assert.assertMatrix
      .filter((row) => row.assertions['categories:performance'])
      .map((row) => [row.matchingUrlPattern, row.assertions['categories:performance'][1].minScore]);
    expect(perf).toEqual(
      expect.arrayContaining([
        ['.*index\\.html', 0.9],
        ['.*projets\\.html', 0.85],
        ['.*contact\\.html', 0.85],
        ['.*(competences|parcours|dojo)\\.html', 0.85],
      ])
    );
  });

  it('desktop utilise assertMatrix (index 0,9 / projets 0,85) et preset desktop', () => {
    const desktop = require('../lighthouserc.desktop.cjs');
    expect(desktop.ci.collect.numberOfRuns).toBe(5);
    expect(desktop.ci.collect.settings.preset).toBe('desktop');
    expect(desktop.ci.collect.settings.screenEmulation.mobile).toBe(false);
    expect(desktop.ci.collect.settings.screenEmulation.width).toBe(961);
    const perf = desktop.ci.assert.assertMatrix
      .filter((row) => row.assertions['categories:performance'])
      .map((row) => [row.matchingUrlPattern, row.assertions['categories:performance'][1].minScore]);
    expect(perf).toEqual([
      ['.*index\\.html', 0.9],
      ['.*projets\\.html', 0.85],
    ]);
  });

  it('mobile utilise formFactor mobile cohérent avec screenEmulation', () => {
    expect(mobile.ci.collect.settings.formFactor).toBe('mobile');
    expect(mobile.ci.collect.settings.screenEmulation.mobile).toBe(true);
  });
});
