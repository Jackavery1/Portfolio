import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { injectMentionsHtml } = require('./inject-mentions-html.cjs');

describe('inject-mentions-html', () => {
  it('injecte sommaire et sections statiques dans le HTML', () => {
    const source = fs.readFileSync(path.join(rootDir, 'mentions-legales.html'), 'utf8');
    const out = injectMentionsHtml(source, rootDir);

    expect(out).toContain('class="mentions-sommaire"');
    expect(out).toContain('id="donnees-personnelles"');
    expect(out).toContain('id="js-mentions-email"');
    expect(out).toMatch(/href="mailto:[^"]+"/);
    expect(out).not.toContain('partial-squelette__ligne');
    expect(out).toContain('aria-busy="false"');
    expect(out).toMatch(/<div id="js-mentions-sections" aria-live="polite" aria-busy="false">/);
  });
});
