import { NAVIGATION } from '../../js/config/navigation.js';

/** Pages du site — source unique pour les tests E2E (smoke, responsive, navigation). */
export const PAGES = [
  {
    path: '/index.html',
    fichier: 'index.html',
    h1: /MARTINEZ/i,
    titreSmoke: /JORIS|MARTINEZ/i,
  },
  {
    path: '/projets.html',
    fichier: 'projets.html',
    h1: /SELECT YOUR STAGE/i,
    titreSmoke: /SELECT|STAGE/i,
  },
  {
    path: '/competences.html',
    fichier: 'competences.html',
    h1: /HIGH SCORES/i,
    titreSmoke: /HIGH SCORES|ハイスコア/i,
  },
  {
    path: '/parcours.html',
    fichier: 'parcours.html',
    h1: /STORY MODE/i,
    titreSmoke: /STORY MODE/i,
  },
  {
    path: '/contact.html',
    fichier: 'contact.html',
    h1: /CONTINUE/i,
    titreSmoke: /CONTINUE|INSERT COIN/i,
  },
  {
    path: '/dojo.html',
    fichier: 'dojo.html',
    h1: /DOJO/i,
    titreSmoke: /DOJO/i,
  },
  {
    path: '/mentions-legales.html',
    fichier: 'mentions-legales.html',
    h1: /MENTIONS/i,
    titreSmoke: /MENTIONS LÉGALES/i,
  },
];

export function pageParFichier(fichier) {
  const page = PAGES.find((p) => p.fichier === fichier);
  if (!page) throw new Error(`Page E2E inconnue : ${fichier}`);
  return page;
}

/** Pages du menu principal (flèches clavier) — aligné sur js/config/navigation.js. */
export function pagesNavigationClavier() {
  return NAVIGATION.ORDRE.map((fichier) => {
    const page = pageParFichier(fichier);
    return { path: page.path, h1: page.h1 };
  });
}
