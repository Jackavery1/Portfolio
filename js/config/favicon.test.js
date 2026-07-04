import { describe, expect, it } from 'vitest';
import { FAVICON_CACHE_BUST, FAVICON_PNG, urlFaviconPng } from '../config/favicon.js';

describe('favicon', () => {
  it('construit le href PNG avec cache-bust', () => {
    expect(urlFaviconPng()).toBe(`${FAVICON_PNG}?v=${FAVICON_CACHE_BUST}`);
  });
});
