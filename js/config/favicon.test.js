import { describe, expect, it } from 'vitest';
import { FAVICON_CACHE_BUST, FAVICON_PNG, hrefFaviconPng } from '../config/favicon.js';

describe('favicon', () => {
  it('construit le href PNG avec cache-bust', () => {
    expect(hrefFaviconPng()).toBe(`${FAVICON_PNG}?v=${FAVICON_CACHE_BUST}`);
  });
});
