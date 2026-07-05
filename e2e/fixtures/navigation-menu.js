import { NAVIGATION } from '../../js/config/navigation.js';

/** Titres h1 attendus pour les pages du menu principal (navigation clavier E2E). */
export const H1_MENU_PRINCIPAL = {
  'index.html': /MARTINEZ/i,
  'projets.html': /SELECT YOUR STAGE/i,
  'competences.html': /HIGH SCORES/i,
  'parcours.html': /STORY MODE/i,
  'contact.html': /CONTINUE/i,
};

export function pagesNavigationClavier() {
  return NAVIGATION.ORDRE.map((fichier) => ({
    path: `/${fichier}`,
    h1: H1_MENU_PRINCIPAL[fichier],
  }));
}
