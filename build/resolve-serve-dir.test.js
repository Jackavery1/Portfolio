import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveServeDir, executerResolveServeDirCli } = require('./resolve-serve-dir.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('resolve-serve-dir', () => {
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

  it('préfère .dist-staging-build quand les deux répertoires existent', () => {
    const base = creerTmp('portfolio-serve-dir-');
    const work = path.join(base, '.dist-staging-build');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(work);
    fs.mkdirSync(staging);

    expect(resolveServeDir(base)).toBe(work);
  });

  it('retombe sur .dist-staging si le build work est absent', () => {
    const base = creerTmp('portfolio-serve-dir-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging);

    expect(resolveServeDir(base)).toBe(staging);
  });

  it('retourne null si aucun artefact build', () => {
    const base = creerTmp('portfolio-serve-dir-');
    expect(resolveServeDir(base)).toBeNull();
  });

  it('start:prod et Playwright utilisent run-serve-staging.cjs', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const playwright = fs.readFileSync(path.join(rootDir, 'playwright.config.js'), 'utf8');

    expect(pkg.scripts['start:prod']).toContain('run-serve-staging.cjs');
    expect(playwright).toContain('run-serve-staging.cjs');
  });

  it('validate:html:dist et lighthouserc résolvent le même artefact build', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const lhci = fs.readFileSync(path.join(rootDir, 'lighthouserc.cjs'), 'utf8');
    const lhciDesktop = fs.readFileSync(path.join(rootDir, 'lighthouserc.desktop.cjs'), 'utf8');

    expect(pkg.scripts['validate:html:dist']).toContain('validate-dist-html.cjs');
    expect(lhci).toContain('resolve-static-dist.cjs');
    expect(lhciDesktop).toContain('resolve-static-dist.cjs');
  });

  it('executerResolveServeDirCli écrit le chemin résolu', () => {
    const base = creerTmp('portfolio-serve-dir-cli-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });

    const chunks = [];
    const outcome = executerResolveServeDirCli({
      root: base,
      stdout: { write: (text) => chunks.push(text) },
      exit: () => {},
    });

    expect(outcome.ok).toBe(true);
    expect(chunks.join('')).toBe(staging);
  });

  it('executerResolveServeDirCli sort en erreur sans artefact', () => {
    const base = creerTmp('portfolio-serve-dir-cli-absent-');
    const messages = [];
    let code = 0;

    const outcome = executerResolveServeDirCli({
      root: base,
      stderr: { write: (text) => messages.push(text) },
      exit: (c) => {
        code = c;
      },
    });

    expect(outcome.ok).toBe(false);
    expect(code).toBe(1);
    expect(messages.join('')).toContain('Aucun répertoire');
  });
});
