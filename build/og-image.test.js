import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { patchOgImageWebp } = require('./og-image.cjs');

describe('og-image', () => {
  /** @type {string[]} */
  let tmpDirs = [];

  afterEach(() => {
    tmpDirs.forEach((dir) => {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    });
    tmpDirs = [];
  });

  function creerDist(html) {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-og-'));
    tmpDirs.push(dist);
    fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');
    return dist;
  }

  it('remplace og.png par og.webp quand le WebP est présent', () => {
    const siteBase = 'https://example.com/Portfolio';
    const dist = creerDist(
      '<meta property="og:image" content="https://example.com/Portfolio/assets/og.png" />'
    );
    fs.writeFileSync(path.join(dist, 'assets', 'og.webp'), '', 'utf8');
    fs.writeFileSync(path.join(dist, 'assets', 'og.png'), '', 'utf8');

    patchOgImageWebp(dist, siteBase);

    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    expect(html).toContain(`${siteBase}/assets/og.webp`);
    expect(html).not.toContain('/assets/og.png');
    expect(fs.existsSync(path.join(dist, 'assets', 'og.png'))).toBe(false);
  });

  it('remplace le chemin relatif assets/og.png', () => {
    const dist = creerDist('<meta property="og:image" content="assets/og.png" />');
    fs.writeFileSync(path.join(dist, 'assets', 'og.webp'), '', 'utf8');
    fs.writeFileSync(path.join(dist, 'assets', 'og.png'), '', 'utf8');

    patchOgImageWebp(dist, 'https://example.com');

    const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
    expect(html).toContain('content="assets/og.webp"');
    expect(fs.existsSync(path.join(dist, 'assets', 'og.png'))).toBe(false);
  });

  it('ignore les pages sans og.png', () => {
    const dist = creerDist('<meta property="og:image" content="assets/og.webp" />');
    fs.writeFileSync(path.join(dist, 'assets', 'og.webp'), '', 'utf8');
    const avant = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

    patchOgImageWebp(dist, 'https://example.com');

    expect(fs.readFileSync(path.join(dist, 'index.html'), 'utf8')).toBe(avant);
  });

  it('retire og.png du dist même si le HTML pointe déjà vers webp', () => {
    const dist = creerDist('<meta property="og:image" content="assets/og.webp" />');
    fs.writeFileSync(path.join(dist, 'assets', 'og.webp'), '', 'utf8');
    fs.writeFileSync(path.join(dist, 'assets', 'og.png'), '', 'utf8');

    patchOgImageWebp(dist, 'https://example.com');

    expect(fs.existsSync(path.join(dist, 'assets', 'og.png'))).toBe(false);
  });

  it('ne plante pas si og.webp est absent', () => {
    const dist = creerDist('<meta property="og:image" content="assets/og.png" />');
    fs.writeFileSync(path.join(dist, 'assets', 'og.png'), '', 'utf8');

    expect(() => patchOgImageWebp(dist, 'https://example.com')).not.toThrow();
    expect(fs.readFileSync(path.join(dist, 'index.html'), 'utf8')).toContain('assets/og.png');
    expect(fs.existsSync(path.join(dist, 'assets', 'og.png'))).toBe(true);
  });
});
