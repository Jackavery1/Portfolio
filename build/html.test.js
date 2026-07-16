import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CONFIG_DEFAULTS } = require('./env.cjs');
const { stripDevHead } = require('./html-head.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const {
  HTML_FILES,
  copyHTML,
  inlinePartials,
  placeholderRegex,
  injectSeoMeta,
  injectPageMeta,
  injectHeadCommon,
  injectCvLien,
  injectFontsAsync,
  injectPerfHead,
  injectJsonLd,
  liensStylesProd,
} = require('./html.cjs');

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
      expect(built).toContain('<script type="application/ld+json">');
      expect(built).toMatch(/<script type="application\/ld\+json">[\s\S]*<\/body>/);
      expect(built).toContain('"@type":"Person"');
      expect(built).toContain('"@type":"WebSite"');
      expect(built).toContain('"@type":"WebPage"');
      expect(built).toContain('"@id":"https://example.com/#person"');
      expect(built).toContain('assets/fonts/press-start-2p-latin-400.woff2');
      expect(built).toContain('assets/fonts/vt323-latin-400.woff2');
      expect(built).not.toContain('assets/fonts/rajdhani-latin-400.woff2');
      expect(built).not.toContain('rel="preload" href="style-base.css"');
      expect(built).not.toContain('rel="modulepreload" href="js/main.js"');
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
      expect(built).toContain(CONFIG_DEFAULTS.cvHref);
      expect(built).not.toContain('href="assets/cv-martinez-joris.pdf"');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('liste toutes les pages HTML du site', () => {
    expect(HTML_FILES).toContain('contact.html');
    expect(HTML_FILES).toHaveLength(7);
  });

  it('injecte le contenu mentions légales au build (perf / CLS)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-build-'));
    try {
      copyHTML(rootDir, tmp, 'https://example.com');
      const built = fs.readFileSync(path.join(tmp, 'mentions-legales.html'), 'utf8');
      expect(built).not.toContain('rel="modulepreload" href="js/modules/mentions-legales.js"');
      expect(built).toContain('class="mentions-intro"');
      expect(built).toContain('class="mentions-sommaire"');
      expect(built).toContain('id="donnees-personnelles"');
      expect(built).toMatch(/href="mailto:[^"]+"/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('injectSeoMeta insère og:url si la balise est absente', () => {
    const html = `<head><meta property="og:locale" content="fr_FR" /></head>`;
    const out = injectSeoMeta(html, 'index.html', 'https://example.com');
    expect(out).toContain('id="meta-og-url"');
    expect(out).toContain('https://example.com/');
  });

  it('injectSeoMeta force og:image vers og.webp', () => {
    const html = `<head><meta property="og:image" content="assets/og.png" /></head>`;
    const out = injectSeoMeta(html, 'index.html', 'https://example.com');
    expect(out).toContain('content="https://example.com/assets/og.webp"');
    expect(out).not.toContain('og.png');
  });

  it('injectPageMeta laisse le HTML inchangé pour une page inconnue', () => {
    const html = '<title>Test</title>';
    expect(injectPageMeta(html, 'inconnue.html')).toBe(html);
  });

  it('injectHeadCommon ignore si le marqueur est absent', () => {
    const html = '<head><title>x</title></head>';
    expect(injectHeadCommon(html, rootDir)).toBe(html);
  });

  it('injectFontsAsync ignore si le marqueur est absent', () => {
    const html = '<head></head>';
    expect(injectFontsAsync(html, rootDir)).toBe(html);
  });

  it('injectPerfHead remplace style.css monolithique si STYLES_PROD absent', () => {
    const html = `<head><link rel="stylesheet" href="style.css" /></head>`;
    const out = injectPerfHead(html, 'contact.html', rootDir);
    expect(out).toContain('style-base.css');
    expect(out).toContain('style-page-contact.css');
    expect(out).not.toContain('href="style.css"');
  });

  it('injectJsonLd ignore une page sans meta ogTitle', () => {
    const html = '<head></head>';
    expect(injectJsonLd(html, 'inconnue.html', 'https://example.com')).toBe(html);
  });

  it('liensStylesProd retourne un tableau vide pour une page inconnue', () => {
    expect(liensStylesProd('inconnue.html')).toEqual([]);
  });

  it('inlinePartials conserve le HTML si le placeholder ne correspond pas', () => {
    const html = '<div id="partial-inexistant"></div>';
    const out = inlinePartials(html, rootDir);
    expect(out).toBe(html);
  });

  it('injectPerfHead ne change rien si la page n’a pas de CSS prod', () => {
    const html = '<head><link rel="stylesheet" href="style.css" /></head>';
    expect(injectPerfHead(html, 'inconnue.html', rootDir)).toBe(html);
  });

  it('inlinePartials ignore un partial existant sans placeholder correspondant', () => {
    const html = '<div id="autre-placeholder"></div>';
    const out = inlinePartials(html, rootDir);
    expect(out).toBe(html);
  });

  it('placeholderRegex cible header et nav', () => {
    const patterns = placeholderRegex('partial-nav');
    expect(patterns.some((re) => re.test('<header id="partial-nav"></header>'))).toBe(true);
    expect(patterns.some((re) => re.test('<nav id="partial-nav"></nav>'))).toBe(true);
  });

  it('injectHeadCommon avertit si head-common est absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-html-'));
    try {
      const html = '<head><!-- HEAD_COMMON --></head>';
      const out = injectHeadCommon(html, tmp);
      expect(out).toContain('HEAD_COMMON');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('injectFontsAsync avertit si fonts-async est absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-html-'));
    try {
      const html = '<head><!-- FONTS_ASYNC --></head>';
      const out = injectFontsAsync(html, tmp);
      expect(out).toContain('FONTS_ASYNC');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('injectCvLien laisse le lien local si cvHref est local', () => {
    const { CV_HREF_LOCAL } = require('./env.cjs');
    const previous = process.env.PORTFOLIO_CV_URL;
    process.env.PORTFOLIO_CV_URL = CV_HREF_LOCAL;
    try {
      const html = `<a href="${CV_HREF_LOCAL}">CV</a>`;
      expect(injectCvLien(html)).toBe(html);
    } finally {
      if (previous === undefined) delete process.env.PORTFOLIO_CV_URL;
      else process.env.PORTFOLIO_CV_URL = previous;
    }
  });

  it('copyHTML ignore les fichiers HTML absents', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-html-missing-'));
    try {
      const srcHtml = path.join(tmp, 'index.html');
      fs.writeFileSync(
        srcHtml,
        `<!doctype html><html><head><!-- HEAD_COMMON --></head><body></body></html>`,
        'utf8'
      );
      copyHTML(tmp, path.join(tmp, 'dist'), 'https://example.com', {
        htmlFiles: ['index.html', 'absent.html'],
      });
      expect(fs.existsSync(path.join(tmp, 'dist', 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(tmp, 'dist', 'absent.html'))).toBe(false);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
