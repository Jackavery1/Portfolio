import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { precacheUrls, generateServiceWorker } = require('./sw.cjs');
const { HTML_FILES } = require('./html.cjs');

describe('build service worker', () => {
  it('precache les pages, JS, polices et offline', () => {
    const urls = precacheUrls(rootDir);

    expect(urls).toContain('offline.html');
    expect(urls).toContain('styles/tokens.css');
    expect(urls).toContain('styles/pages/offline.css');
    expect(urls).toContain('style-base.css');
    expect(urls).toContain('js/main.js');
    expect(urls).toContain('manifest.webmanifest');
    expect(urls).toContain('assets/apple-touch-icon.png');
    expect(urls).toContain('assets/icon-192.png');
    expect(urls).toContain('assets/icon-512.png');
    expect(urls).toContain('assets/cv-martinez-joris.pdf');
    expect(urls.some((url) => url.startsWith('js/modules/'))).toBe(true);
    expect(urls.some((url) => url.startsWith('assets/fonts/'))).toBe(
      fs.existsSync(path.join(rootDir, 'assets', 'fonts'))
    );
    if (fs.existsSync(path.join(rootDir, 'assets', 'previews'))) {
      expect(urls.some((url) => url.startsWith('assets/previews/'))).toBe(true);
    }
    HTML_FILES.forEach((file) => {
      expect(urls).toContain(file);
    });
  });

  it('génère un SW avec precache et fallback offline', () => {
    const source = generateServiceWorker('1.0.2', rootDir);
    expect(source).toContain('portfolio-arcade-v1-0-2');
    expect(source).toContain('offline.html');
    expect(source).toContain('chercherOffline');
    expect(source).toContain("request.mode === 'navigate'");
    expect(source).toContain('Promise.allSettled');
  });
});
