export const FAVICON_PNG = 'assets/favicon.png';
export const FAVICON_CACHE_BUST = '20260527';

export function hrefFaviconPng() {
  return `${FAVICON_PNG}?v=${FAVICON_CACHE_BUST}`;
}
