import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runServeStaging } = require('./run-serve-staging.cjs');
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

  it('module CLI exporté pour start:prod et Playwright', () => {
    const source = fs.readFileSync(path.join(rootDir, 'build', 'run-serve-staging.cjs'), 'utf8');
    expect(source).toContain('runServeStaging');
    expect(source).toContain('require.main === module');
  });
});
