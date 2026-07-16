import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const {
  precacheUrls,
  generateServiceWorker,
  writeServiceWorker,
  JS_PRECACH_EXCLUS,
} = require('./sw.cjs');
const { HTML_FILES } = require('./html.cjs');

describe('build service worker', () => {
  it('precache les pages, JS core, polices et offline', () => {
    const urls = precacheUrls(rootDir);

    expect(urls).toContain('offline.html');
    expect(urls).toContain('style-page-offline.css');
    expect(urls).not.toContain('styles/tokens.css');
    expect(urls).not.toContain('styles/pages/offline.css');
    expect(urls).toContain('style-base.css');
    expect(urls).toContain('style-page-accueil.css');
    expect(urls).toContain('style-page-projets.css');
    expect(urls).toContain('style-page-contact.css');
    expect(urls).toContain('style-page-dojo.css');
    expect(urls).toContain('js/main.js');
    expect(urls).toContain('js/modules/musique-loader.js');
    expect(urls).toContain('manifest.webmanifest');
    expect(urls).toContain('assets/apple-touch-icon.png');
    expect(urls).toContain('assets/icon-192.png');
    expect(urls).not.toContain('assets/icon-512.png');
    expect(urls).not.toContain('assets/cv-martinez-joris.pdf');
    expect(urls).not.toContain('js/config/musique-themes.json');
    expect(urls).not.toContain('js/modules/musique.js');
    expect(urls).toContain('js/config/projects-data.js');
    expect(urls).toContain('js/modules/projets-grille.js');
    expect(urls).toContain('js/modules/contact.js');
    expect(urls).toContain('js/modules/dojo-boss.js');
    expect(urls.some((url) => url.startsWith('js/modules/'))).toBe(true);
    expect(urls.some((url) => url.startsWith('assets/fonts/'))).toBe(
      fs.existsSync(path.join(rootDir, 'assets', 'fonts'))
    );
    if (fs.existsSync(path.join(rootDir, 'assets', 'previews'))) {
      expect(urls.some((url) => url.startsWith('assets/previews/'))).toBe(false);
    }
    JS_PRECACH_EXCLUS.forEach((rel) => {
      expect(urls).not.toContain(rel);
    });
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
    expect(source).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(source).toContain('self.registration?.active');
  });

  it('precacheUrls ignore un dossier fonts absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-sw-'));
    try {
      fs.mkdirSync(path.join(tmp, 'js'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'js', 'main.js'), 'export {};\n', 'utf8');
      const urls = precacheUrls(tmp);
      expect(urls.some((url) => url.startsWith('assets/fonts/'))).toBe(false);
      expect(urls).toContain('js/main.js');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('writeServiceWorker écrit sw.js sur disque', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-sw-write-'));
    try {
      fs.mkdirSync(path.join(tmp, 'js'), { recursive: true });
      fs.writeFileSync(path.join(tmp, 'js', 'main.js'), 'export {};\n', 'utf8');
      writeServiceWorker(tmp, '9.9.9');
      const sw = fs.readFileSync(path.join(tmp, 'sw.js'), 'utf8');
      expect(sw).toContain('portfolio-arcade-v9-9-9');
      expect(sw).toContain('offline.html');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
