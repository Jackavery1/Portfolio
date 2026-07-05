export function obtenirFichierPageCourante(
  pathname = typeof window !== 'undefined' ? window.location.pathname : ''
) {
  const segment = pathname.split('/').pop() || 'index.html';
  return segment.split('?')[0].split('#')[0];
}

function normaliserFichierPage(file) {
  const base = String(file ?? 'index.html')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase();
  return base || 'index.html';
}

export function fichierPageDepuisPathname(pathname) {
  const brut = normaliserFichierPage(obtenirFichierPageCourante(pathname));
  if (!brut || brut === 'index') return 'index.html';
  if (!brut.includes('.')) return `${brut}.html`;
  return brut;
}
