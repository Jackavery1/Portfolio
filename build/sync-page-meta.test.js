import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { verifierPageMeta } = require('./sync-page-meta.cjs');

describe('sync-page-meta', () => {
  it('les HTML sources reflètent build/page-meta.cjs', () => {
    expect(verifierPageMeta(rootDir)).toEqual([]);
  });
});
