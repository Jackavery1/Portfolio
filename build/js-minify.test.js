import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { CONFIG_DEFAULTS } from './env.cjs';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { minifyAllJs } = require('./js-minify.cjs');

describe('js-minify', () => {
  /** @type {string[]} */
  let tmpDirs = [];

  afterEach(() => {
    tmpDirs.forEach((dir) => {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    });
    tmpDirs = [];
  });

  function creerTmp(prefix) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    tmpDirs.push(dir);
    return dir;
  }

  it('minifie les modules JS vers le répertoire de sortie', () => {
    const srcRoot = creerTmp('portfolio-jsmin-src-');
    const distRoot = creerTmp('portfolio-jsmin-dist-');
    const source = 'export const valeur = 42;\n// commentaire\n';
    fs.mkdirSync(path.join(srcRoot, 'js', 'utils'), { recursive: true });
    fs.writeFileSync(path.join(srcRoot, 'js', 'demo.js'), source, 'utf8');
    fs.writeFileSync(path.join(srcRoot, 'js', 'utils', 'dom.test.js'), source, 'utf8');

    minifyAllJs(srcRoot, distRoot);

    const minified = path.join(distRoot, 'js', 'demo.js');
    expect(fs.existsSync(minified)).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'js', 'utils', 'dom.test.js'))).toBe(false);

    const output = fs.readFileSync(minified, 'utf8');
    expect(output.length).toBeLessThan(source.length);
    expect(output).not.toContain('commentaire');
    expect(output).toContain('42');
  });

  it('applique les substitutions build env sur config/', () => {
    vi.stubEnv('PORTFOLIO_SITE_URL', 'https://preview.example.com');
    const srcRoot = creerTmp('portfolio-jsmin-src-');
    const distRoot = creerTmp('portfolio-jsmin-dist-');
    fs.mkdirSync(path.join(srcRoot, 'js', 'config'), { recursive: true });
    fs.writeFileSync(
      path.join(srcRoot, 'js', 'config', 'defaults.js'),
      `export const SITE = "${CONFIG_DEFAULTS.siteOrigin}";`,
      'utf8'
    );

    minifyAllJs(srcRoot, distRoot);

    const output = fs.readFileSync(path.join(distRoot, 'js', 'config', 'defaults.js'), 'utf8');
    expect(output).toContain('https://preview.example.com');
    expect(output).not.toContain(CONFIG_DEFAULTS.siteOrigin);
  });

  it('ignore un dossier js/ absent sans erreur', () => {
    const srcRoot = creerTmp('portfolio-jsmin-src-');
    const distRoot = creerTmp('portfolio-jsmin-dist-');

    expect(() => minifyAllJs(srcRoot, distRoot)).not.toThrow();
    expect(fs.existsSync(path.join(distRoot, 'js'))).toBe(false);
  });

  it('lève une erreur si UglifyJS échoue', () => {
    const srcRoot = creerTmp('portfolio-jsmin-src-');
    const distRoot = creerTmp('portfolio-jsmin-dist-');
    fs.mkdirSync(path.join(srcRoot, 'js'), { recursive: true });
    fs.writeFileSync(path.join(srcRoot, 'js', 'invalid.js'), 'export const x = ;', 'utf8');

    expect(() => minifyAllJs(srcRoot, distRoot)).toThrow(/UglifyJS/);
  });

  it('minifie le projet réel sans erreur', { timeout: 10_000 }, () => {
    const distRoot = creerTmp('portfolio-jsmin-dist-');
    minifyAllJs(rootDir, distRoot);
    expect(fs.existsSync(path.join(distRoot, 'js', 'main.js'))).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'js', 'config', 'musique-themes.json'))).toBe(true);
    expect(fs.existsSync(path.join(distRoot, 'js', 'config', 'legal.json'))).toBe(false);
    expect(fs.existsSync(path.join(distRoot, 'js', 'config', 'projects.json'))).toBe(false);
    expect(fs.existsSync(path.join(distRoot, 'js', 'config', 'musique-donnees.json'))).toBe(false);
  });

  it('copie uniquement les JSON runtime de js/config/', () => {
    const srcRoot = creerTmp('portfolio-jsmin-src-');
    const distRoot = creerTmp('portfolio-jsmin-dist-');
    fs.mkdirSync(path.join(srcRoot, 'js', 'config'), { recursive: true });
    fs.writeFileSync(
      path.join(srcRoot, 'js', 'config', 'musique-themes.json'),
      '{"ok":true}',
      'utf8'
    );
    fs.writeFileSync(path.join(srcRoot, 'js', 'config', 'legal.json'), '{"src":true}', 'utf8');
    fs.writeFileSync(path.join(srcRoot, 'js', 'demo.js'), 'export const x = 1;', 'utf8');

    minifyAllJs(srcRoot, distRoot);

    expect(
      fs.readFileSync(path.join(distRoot, 'js', 'config', 'musique-themes.json'), 'utf8')
    ).toBe('{"ok":true}');
    expect(fs.existsSync(path.join(distRoot, 'js', 'config', 'legal.json'))).toBe(false);
  });
});
