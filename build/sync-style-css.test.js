import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { ensureSyncSource } from './ensure-sync.cjs';

const require = createRequire(import.meta.url);
const { allMonolithSources, BASE_STYLE_SOURCES, PAGE_STYLE_BY_HTML } = require('./page-styles.mjs');
const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('style.css sync', () => {
  beforeAll(() => {
    ensureSyncSource();
  });

  it('style.css reflète page-styles.mjs', () => {
    const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');
    allMonolithSources().forEach((source) => {
      expect(styleCss).toContain(`@import url("${source}");`);
    });
  });

  it('allMonolithSources inclut base et pages', () => {
    const sources = allMonolithSources();
    expect(sources.slice(0, BASE_STYLE_SOURCES.length)).toEqual(BASE_STYLE_SOURCES);
    const pageCount = Object.values(PAGE_STYLE_BY_HTML).flatMap(({ sources: s }) => s).length;
    expect(sources).toHaveLength(BASE_STYLE_SOURCES.length + pageCount);
  });
});
