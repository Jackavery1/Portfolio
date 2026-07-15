const PAGES_DENSES = new Set(['competences', 'parcours', 'dojo']);

export function estPageDense(sectionId) {
  return PAGES_DENSES.has(sectionId);
}
