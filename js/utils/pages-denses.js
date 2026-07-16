/** Pages à contenu dense : différer le travail non critique via requestIdleCallback. */

const PAGES_DENSES = new Set(['competences', 'parcours', 'dojo']);

export function estPageDense(sectionId) {
  return PAGES_DENSES.has(sectionId);
}

/**
 * Sur page dense avec idle dispo : planifie `fn` et retourne true.
 * Sinon retourne false (l’appelant exécute le chemin immédiat).
 */
export function planifierIdleDense(sectionId, fn, timeout) {
  if (estPageDense(sectionId) && typeof requestIdleCallback === 'function') {
    requestIdleCallback(fn, { timeout });
    return true;
  }
  return false;
}
