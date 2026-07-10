import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { ensureSyncSource } from './ensure-sync.cjs';

const require = createRequire(import.meta.url);
const { syncDefaults } = require('./sync-defaults.cjs');
const CONFIG_DEFAULTS = require('./config-defaults.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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
    expect(content).toContain(`LINKEDIN: '${CONFIG_DEFAULTS.social.linkedin}'`);
    expect(content).toMatch(/Généré par build\/sync-defaults\.cjs/);
  });
});
