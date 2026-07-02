import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { genererVariablesBp, syncBreakpoints } from './sync-breakpoints.cjs';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sync-breakpoints', () => {
  it('génère toutes les variables CSS depuis breakpoints.cjs', () => {
    const BP = require('./breakpoints.cjs');
    const bloc = genererVariablesBp();
    expect(bloc).toContain(`--bp-mobile-etroit: ${BP.MOBILE_ETROIT_MAX}px`);
    expect(bloc).toContain('BREAKPOINTS_SYNC_START');
  });

  it('met à jour tokens.css', () => {
    syncBreakpoints(rootDir);
    const tokens = fs.readFileSync(path.join(rootDir, 'styles', 'tokens.css'), 'utf8');
    expect(tokens).toContain('--bp-mobile-etroit: 320px');
  });
});
