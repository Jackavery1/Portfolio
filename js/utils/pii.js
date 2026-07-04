/* ============================================
   Décodage coordonnées (réduction scraping HTML statique)
   ============================================ */

export function decoderBase64Utf8(b64) {
  try {
    return atob(b64);
  } catch {
    return '';
  }
}

export function formaterTelephoneFr(parts) {
  if (!Array.isArray(parts) || parts.length < 2) return { affichage: '', tel: '' };
  const [p0, ...rest] = parts.map((n) => String(n).replace(/\D/g, ''));
  const national = `${p0}${rest.join('')}`;
  const affichage = `0${p0} ${rest.join(' ')}`;
  const tel = `+33${national}`;
  return { affichage, tel };
}
