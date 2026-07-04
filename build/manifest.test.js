import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildManifest } = require('./manifest.cjs');
const CONFIG_DEFAULTS = require('./config-defaults.cjs');

describe('build manifest', () => {
  const siteBase = 'https://example.com/portfolio';

  it('expose un manifest installable', () => {
    const manifest = buildManifest(siteBase);

    expect(manifest.name).toBe(CONFIG_DEFAULTS.person.siteName);
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe(`${siteBase}/index.html`);
    expect(manifest.scope).toBe(`${siteBase}/`);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true);
    expect(manifest.icons[0].src).toContain('icon-192.png');
    expect(manifest.theme_color).toBe('#03040f');
  });

  it('expose un manifest dev aligné sur la prod (icônes PWA)', () => {
    const { buildDevManifest } = require('./manifest.cjs');
    const manifest = buildDevManifest();

    expect(manifest.start_url).toBe('./index.html');
    expect(manifest.scope).toBe('./');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some((icon) => icon.sizes === '512x512')).toBe(true);
    expect(manifest.icons[0].src).toMatch(/^\.\/assets\//);
  });
});
