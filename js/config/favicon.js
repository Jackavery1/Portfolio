export const CHEMIN_FAVICON_PNG = 'assets/favicon.png';
export const VERSION_CACHE_FAVICON = '20260708';

export function urlFaviconPng() {
  return `${CHEMIN_FAVICON_PNG}?v=${VERSION_CACHE_FAVICON}`;
}
