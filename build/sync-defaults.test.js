import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { ensureSyncSource } from './ensure-sync.cjs';

const require = createRequire(import.meta.url);
const { syncDefaults, escapeJsString } = require('./sync-defaults.cjs');
const CONFIG_DEFAULTS = require('./config-defaults.mjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(rootDir, 'build', 'sync-defaults.cjs');

describe('sync-defaults', () => {
  beforeAll(() => {
    ensureSyncSource();
  });

  it('génère defaults.js avec les exports attendus', () => {
    syncDefaults();
    const content = fs.readFileSync(path.join(rootDir, 'js', 'config', 'defaults.js'), 'utf8');
    expect(content).toContain(`export const SITE_ORIGIN = '${CONFIG_DEFAULTS.siteOrigin}'`);
    expect(content).toContain(`export const PERSON_NAME = '${CONFIG_DEFAULTS.person.name}'`);
    expect(content).toContain(`export const FORMSPREE_ENDPOINT = '${CONFIG_DEFAULTS.formspree}'`);
    expect(content).toContain(`export const RECAPTCHA_SITE_KEY = '${CONFIG_DEFAULTS.recaptcha}'`);
    expect(content).toContain(`GITHUB: '${CONFIG_DEFAULTS.social.github}'`);
    expect(content).not.toContain('LINKEDIN');
    expect(content).toMatch(/Généré par build\/sync-defaults\.cjs/);
  });

  it('escapeJsString échappe backslash et apostrophe', () => {
    expect(escapeJsString("O'Reilly")).toBe("O\\'Reilly");
    expect(escapeJsString('C:\\path')).toBe('C:\\\\path');
  });

  it('CLI exécute syncDefaults sans erreur', () => {
    const resultat = spawnSync(process.execPath, [scriptPath], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    expect(resultat.status).toBe(0);
    expect(fs.existsSync(path.join(rootDir, 'js', 'config', 'defaults.js'))).toBe(true);
  });
});
