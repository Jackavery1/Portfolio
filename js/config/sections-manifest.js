/**
 * Manifeste des sections — source unique pour data-section-id.
 * Nouvelle page lazy-load : ajouter l’id ici + charges dans sections-registry.js.
 */

export const SECTIONS_AVEC_INITIALISEUR = [
  'accueil',
  'projets',
  'dojo',
  'contact',
  'mentions',
];

export const SECTIONS_STATIQUES = ['parcours', 'competences'];

export const TOUTES_LES_SECTIONS = [
  ...SECTIONS_AVEC_INITIALISEUR,
  ...SECTIONS_STATIQUES,
];

export const LIBELLES_NAV_ARCADE_FR = {
  HOME: 'Accueil',
  WORK: 'Projets',
  STATS: 'Compétences',
  STORY: 'Parcours',
  CONTACT: 'Contact',
};
