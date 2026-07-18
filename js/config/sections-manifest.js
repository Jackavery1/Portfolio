/**
 * Manifeste des sections — source unique pour data-section-id.
 * Nouvelle page lazy-load : ajouter l’id ici + charges dans sections-registry.js.
 */

export const SECTIONS_AVEC_INITIALISEUR = ['projets', 'dojo', 'contact', 'mentions'];

const SECTIONS_STATIQUES = ['accueil', 'parcours', 'competences'];

export const TOUTES_LES_SECTIONS = [...SECTIONS_AVEC_INITIALISEUR, ...SECTIONS_STATIQUES];
