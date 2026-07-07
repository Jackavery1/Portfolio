import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { HTML_FILES, copyHTML } = require('./html.cjs');

function stripDevHead(html) {
  const re = /<!-- HEAD_DEV_MIN[^>]*-->[\s\S]*?<!-- \/HEAD_DEV_MIN -->\s*/i;
  return html.replace(re, '');
}

describe('build html', () => {
  it('retire le bloc HEAD_DEV_MIN commenté', () => {
    const src = fs.readFileSync(path.join(rootDir, 'contact.html'), 'utf8');
    const out = stripDevHead(src);
    expect(out).not.toContain('HEAD_DEV_MIN');
    expect(out).not.toMatch(
      /<link rel="stylesheet" href="style\.css" \/>\s*<link rel="stylesheet" href="style\.css" \/>/
    );
  });

  it('produit un HTML sans doublon CSS ni canonical vide', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-build-'));
    try {
      copyHTML(rootDir, tmp, 'https://example.com');
      const built = fs.readFileSync(path.join(tmp, 'contact.html'), 'utf8');
      expect(built).toContain('href="style-base.css"');
      expect(built).toContain('href="style-page-contact.css"');
      expect(built).not.toMatch(/rel="stylesheet" href="style\.css"/);
      expect(built).not.toContain('<!-- FONTS_ASYNC -->');
      expect(built).not.toMatch(
        /<link[^>]+href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"[^>]*rel="stylesheet"/
      );
      expect(built).toContain('property="og:title" content="Contact · Joris Martinez"');
      expect(built).toContain('property="og:site_name" content="Joris Martinez · Portfolio"');
      expect(built).toContain('property="og:image:width" content="1536"');
      expect(built).toContain('property="og:image:height" content="1024"');
      expect(built).toContain('"@type": "Person"');
      expect(built).toContain('"@type": "WebSite"');
      expect(built).toContain('"@type": "WebPage"');
      expect(built).toContain('"@id": "https://example.com/#person"');
      expect(built).toContain('rel="modulepreload" href="js/main.js"');
      expect(built).toContain('name="twitter:title" content="Contact · Joris Martinez"');
      expect(built).toContain('href="https://example.com/contact.html"');
      expect(built).not.toContain('href="" id="link-canonical"');
      expect(built).toContain('http-equiv="Content-Security-Policy"');
      expect(built).toContain("style-src 'self'");
      expect(built).not.toContain('fonts.googleapis.com');
      expect(built).toContain("style-src-attr 'unsafe-inline'");
      expect(built).not.toContain("style-src 'self' 'unsafe-inline'");
      expect(built).toContain('id="js-score"');
      expect(built).not.toContain('nav--squelette');
      expect(built).not.toContain('nav__liens--squelette');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('liste toutes les pages HTML du site', () => {
    expect(HTML_FILES).toContain('contact.html');
    expect(HTML_FILES).toHaveLength(7);
  });

  it('précharge le module mentions légales sur la page dédiée', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-build-'));
    try {
      copyHTML(rootDir, tmp, 'https://example.com');
      const built = fs.readFileSync(path.join(tmp, 'mentions-legales.html'), 'utf8');
      expect(built).toContain('rel="modulepreload" href="js/modules/mentions-legales.js"');
      expect(built).toContain('class="mentions-intro"');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
