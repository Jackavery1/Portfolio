export function getCurrentPageFile(pathname = typeof window !== 'undefined' ? window.location.pathname : '') {
  const segment = pathname.split('/').pop() || 'index.html';
  return segment.split('?')[0].split('#')[0];
}

export function normalizePageFile(file) {
  const base = String(file ?? 'index.html').split('?')[0].split('#')[0].toLowerCase();
  return base || 'index.html';
}

export function pageFileFromPathname(pathname) {
  return normalizePageFile(getCurrentPageFile(pathname));
}
