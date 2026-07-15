import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runServeStaging, executerRunServeStagingCli } = require('./run-serve-staging.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('run-serve-staging', () => {
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

  it('échoue proprement sans artefact build', () => {
    const base = creerTmp('portfolio-serve-run-');
    const outcome = runServeStaging({
      root: base,
      port: '4321',
      spawn: () => ({ status: 0 }),
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.code).toBe(1);
    expect(outcome.dir).toBeNull();
  });

  it('lance serve sur le répertoire résolu', () => {
    const base = creerTmp('portfolio-serve-run-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });
    fs.writeFileSync(path.join(staging, 'index.html'), '<html></html>', 'utf8');

    const calls = [];
    const outcome = runServeStaging({
      root: base,
      port: '4321',
      spawn: (...args) => {
        calls.push(args);
        return { status: 0 };
      },
    });

    expect(outcome.ok).toBe(true);
    expect(outcome.dir).toBe(staging);
    expect(outcome.code).toBe(0);
    expect(calls[0][0]).toBe('npx');
    expect(calls[0][1]).toEqual(['serve', staging, '-l', '4321']);
  });

  it('runServeStaging utilise le code 1 si spawn ne retourne pas de status', () => {
    const base = creerTmp('portfolio-serve-run-status-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });

    const outcome = runServeStaging({
      root: base,
      port: '4321',
      spawn: () => ({}),
    });

    expect(outcome.ok).toBe(true);
    expect(outcome.code).toBe(1);
  });

  it('module CLI exporté pour start:prod et Playwright', () => {
    const source = fs.readFileSync(path.join(rootDir, 'build', 'run-serve-staging.cjs'), 'utf8');
    expect(source).toContain('runServeStaging');
    expect(source).toContain('executerRunServeStagingCli');
    expect(source).toContain('executerSiEntreeDirecte');
  });

  it('executerRunServeStagingCli propage le code de sortie serve', () => {
    const base = creerTmp('portfolio-serve-run-cli-');
    const staging = path.join(base, '.dist-staging');
    fs.mkdirSync(staging, { recursive: true });

    let code = 0;
    const outcome = executerRunServeStagingCli({
      root: base,
      port: '9876',
      spawn: () => ({ status: 0 }),
      exit: (c) => {
        code = c;
      },
    });

    expect(outcome.ok).toBe(true);
    expect(code).toBe(0);
  });

  it('executerRunServeStagingCli sort 1 sans artefact build', () => {
    const base = creerTmp('portfolio-serve-run-cli-absent-');
    let code = 0;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const outcome = executerRunServeStagingCli({
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
