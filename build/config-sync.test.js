import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const CONFIG_DEFAULTS = require('./config-defaults.cjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const defaultsJs = fs.readFileSync(path.join(rootDir, 'js', 'config', 'defaults.js'), 'utf8');

describe('config defaults sync', () => {
  it('defaults.js reflète build/config-defaults.cjs', () => {
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.siteOrigin);
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.formspree);
    expect(defaultsJs).toContain(CONFIG_DEFAULTS.recaptcha);
  });
});
