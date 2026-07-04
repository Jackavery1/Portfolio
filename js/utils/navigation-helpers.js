import { pageFileFromPathname } from './page.js';

const LIBELLES_PAGES_NAV = {
  'index.html': 'Accueil',
  'projets.html': 'Projets',
  'competences.html': 'Compétences',
  'parcours.html': 'Parcours',
  'contact.html': 'Contact',
};

export function libellerPageNavigation(fichier) {
  return LIBELLES_PAGES_NAV[fichier] ?? fichier.replace(/\.html$/, '');
}

export function indexDansOrdreNavigation(pathname, ordre) {
  const file = pageFileFromPathname(pathname);
  return ordre.indexOf(file);
}
