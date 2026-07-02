import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { writeSeoFiles } = require('./seo.cjs');

describe('build seo', () => {
  it('génère sitemap.xml et robots.txt', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-seo-'));
    try {
      writeSeoFiles(tmp, 'https://example.com');
      const sitemap = fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8');
      const robots = fs.readFileSync(path.join(tmp, 'robots.txt'), 'utf8');

      expect(sitemap).toContain('<loc>https://example.com/</loc>');
      expect(sitemap).toContain('<loc>https://example.com/contact.html</loc>');
      expect(sitemap).toContain('<priority>1.0</priority>');
      expect(sitemap).toContain('<priority>0.4</priority>');
      expect(sitemap).toContain('<lastmod>');
      expect(sitemap).toContain('<changefreq>monthly</changefreq>');
      expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');

      const manifest = JSON.parse(fs.readFileSync(path.join(tmp, 'manifest.webmanifest'), 'utf8'));
      expect(manifest.display).toBe('standalone');
      expect(manifest.start_url).toBe('https://example.com/index.html');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
