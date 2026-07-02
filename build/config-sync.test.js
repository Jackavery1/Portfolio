import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { ensureSyncSource } from './ensure-sync.cjs';

const require = createRequire(import.meta.url);
const CONFIG_DEFAULTS = require('./config-defaults.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('config defaults sync', () => {
  beforeAll(() => {
    ensureSyncSource();
  });

  it('defaults.js reflète build/config-defaults.cjs', () => {
    const defaultsJs = fs.readFileSync(path.join(rootDir, 'js', 'config', 'defaults.js'), 'utf8');
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.siteOrigin);
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.formspree);
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.recaptcha);
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.social.github);
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.person.name);
    expect(defaultsJs).toContain('PERSON_NAME');
    expect(defaultsJs).toContain('SOCIAL');
  });

  it('person est défini pour JSON-LD', () => {
    expect(CONFIG_DEFAULTS.person.name).toBeTruthy();
    expect(CONFIG_DEFAULTS.person.jobTitle).toBeTruthy();
    expect(CONFIG_DEFAULTS.person.siteName).toBeTruthy();
  });
});
