import { describe, expect, it } from 'vitest';
import { VERSION_CACHE_FAVICON, CHEMIN_FAVICON_PNG, urlFaviconPng } from '../config/favicon.js';

describe('favicon', () => {
  it('construit le href PNG avec cache-bust', () => {
    expect(urlFaviconPng()).toBe(`${CHEMIN_FAVICON_PNG}?v=${VERSION_CACHE_FAVICON}`);
  });
});
