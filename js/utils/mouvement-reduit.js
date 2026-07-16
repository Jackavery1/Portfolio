/** Détecte prefers-reduced-motion pour scroll et animations. */

export function prefereMouvementReduit() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
