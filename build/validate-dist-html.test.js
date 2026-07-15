import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { validerDistHtml, executerValiderDistHtmlCli } = require('./validate-dist-html.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('validate-dist-html', () => {
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

  it('échoue sans artefact build', () => {
    const base = creerTmp('portfolio-validate-dist-');
    const outcome = validerDistHtml({ root: base, spawn: () => ({ status: 0 }) });
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe(1);
    expect(outcome.dir).toBeNull();
  });

  it('lance html-validate sur le répertoire résolu', () => {
    const base = creerTmp('portfolio-validate-dist-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<!DOCTYPE html><html></html>', 'utf8');

    const calls = [];
    const outcome = validerDistHtml({
      root: base,
      spawn: (...args) => {
        calls.push(args);
        return { status: 0 };
      },
    });

    expect(outcome.ok).toBe(true);
    expect(outcome.dir).toBe(staging);
    expect(outcome.code).toBe(0);
    expect(calls[0][0]).toBe('npx');
    expect(calls[0][1]).toEqual([
      'html-validate',
      '.dist-staging/*.html',
      '.dist-staging/offline.html',
    ]);
  });

  it('validerDistHtml utilise le code 1 si spawn ne retourne pas de status', () => {
    const base = creerTmp('portfolio-validate-dist-status-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });

    const outcome = validerDistHtml({
      root: base,
      spawn: () => ({}),
    });

    expect(outcome.ok).toBe(true);
    expect(outcome.code).toBe(1);
  });

  it('module CLI exporté pour validate:html:dist', () => {
    const source = fs.readFileSync(path.join(rootDir, 'build', 'validate-dist-html.cjs'), 'utf8');
    expect(source).toContain('validerDistHtml');
    expect(source).toContain('executerValiderDistHtmlCli');
    expect(source).toContain('executerSiEntreeDirecte');
  });

  it('executerValiderDistHtmlCli propage le code de sortie html-validate', () => {
    const base = creerTmp('portfolio-validate-dist-cli-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });

    let code = 0;
    const outcome = executerValiderDistHtmlCli({
      root: base,
      spawn: () => ({ status: 2 }),
      exit: (c) => {
        code = c;
      },
    });

    expect(outcome.ok).toBe(true);
    expect(code).toBe(2);
  });

  it('executerValiderDistHtmlCli sort 1 sans artefact build', () => {
    const base = creerTmp('portfolio-validate-dist-cli-absent-');
    let code = 0;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const outcome = executerValiderDistHtmlCli({
      root: base,
      exit: (c) => {
        code = c;
      },
    });

    expect(outcome.ok).toBe(false);
    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
