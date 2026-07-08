export function resoudreSrcApercu(projet) {
  return projet?.apercu || null;
}

export function estImageRaster(src) {
  return /\.(png|jpe?g)$/i.test(src || '');
}

export function cheminWebpDepuisRaster(src) {
  if (!src || typeof src !== 'string') return null;
  if (!estImageRaster(src)) return null;
  return src.replace(/\.(png|jpe?g)$/i, '.webp');
}

export function estLienHttpAutorise(href) {
  if (!href || typeof href !== 'string') return false;
  try {
    const u = new URL(href);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Liens démo + repo filtrés (http/https uniquement) pour la modale projet. */
export function liensProjetValides(projet) {
  const liens = [];
  if (projet?.lienDemo) {
    liens.push({
      href: projet.lienDemo,
      label: projet.lienDemoLabel || '▶ Voir la démo',
    });
  }
  if (projet?.lien) {
    liens.push({
      href: projet.lien,
      label: projet.lienLabel || '▶ Voir le dépôt GitHub',
    });
  }
  return liens.filter(({ href }) => estLienHttpAutorise(href));
}
