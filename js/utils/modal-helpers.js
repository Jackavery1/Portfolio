export function resolveApercuSrc(data) {
  return data?.apercu || null;
}

export function estImageRaster(src) {
  return /\.(png|jpe?g)$/i.test(src || '');
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
export function liensProjetValides(data) {
  const liens = [];
  if (data?.lienDemo) {
    liens.push({
      href: data.lienDemo,
      label: data.lienDemoLabel || '▶ Voir la démo',
    });
  }
  if (data?.lien) {
    liens.push({
      href: data.lien,
      label: data.lienLabel || '▶ Voir le dépôt GitHub',
    });
  }
  return liens.filter(({ href }) => estLienHttpAutorise(href));
}
