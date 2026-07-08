const LAYOUT_STYLE_SOURCES = [
  'styles/layout/marquee.css',
  'styles/layout/ecran.css',
  'styles/layout/utilities.css',
  'styles/layout/responsive.css',
];

const NAV_STYLE_SOURCES = [
  'styles/components/nav/base.css',
  'styles/components/nav/burger.css',
  'styles/components/nav/musique.css',
  'styles/components/nav/fallback.css',
  'styles/components/nav/responsive.css',
  'styles/components/konami.css',
];

const MODAL_STYLE_SOURCES = [
  'styles/components/modal/overlay.css',
  'styles/components/modal/highscore.css',
  'styles/components/modal/responsive.css',
];

const BASE_STYLE_SOURCES = [
  'styles/tokens.css',
  'styles/fonts-local.css',
  'styles/reset.css',
  ...LAYOUT_STYLE_SOURCES,
  'styles/components/crt.css',
  ...NAV_STYLE_SOURCES,
  ...MODAL_STYLE_SOURCES,
  'styles/components/card.css',
  'styles/components/bouton-pixel.css',
  'styles/components/hint-paysage.css',
  'styles/components/form.css',
  'styles/components/footer.css',
];

const ACCUEIL_STYLE_SOURCES = [
  'styles/pages/accueil/layout.css',
  'styles/pages/accueil/hero.css',
  'styles/pages/accueil/actions.css',
  'styles/pages/accueil/illustration.css',
  'styles/pages/accueil/responsive-mobile.css',
  'styles/pages/accueil/responsive-tablette.css',
  'styles/pages/accueil/responsive-landscape.css',
  'styles/pages/accueil/responsive-short.css',
  'styles/pages/accueil/responsive-tablette-portrait.css',
];

const CONTACT_STYLE_SOURCES = [
  'styles/pages/contact/grille.css',
  'styles/pages/contact/bandeau.css',
  'styles/pages/contact/profil.css',
  'styles/pages/contact/responsive-desktop.css',
  'styles/pages/contact/responsive-mobile.css',
];

const DOJO_STYLE_SOURCES = [
  'styles/pages/dojo/intro.css',
  'styles/pages/dojo/boss-cartes.css',
  'styles/pages/dojo/citations.css',
  'styles/pages/dojo/responsive-mobile.css',
  'styles/pages/dojo/responsive-landscape.css',
];

const COMPETENCES_STYLE_SOURCES = [
  'styles/pages/competences/layout.css',
  'styles/pages/competences/scores-tableau.css',
  'styles/pages/competences/stats-lateral.css',
  'styles/pages/competences/responsive-desktop.css',
  'styles/pages/competences/responsive-tablette.css',
  'styles/pages/competences/responsive-mobile.css',
  'styles/pages/competences/responsive-landscape.css',
];

const MENTIONS_LEGALES_STYLE_SOURCES = [
  'styles/pages/mentions-legales/layout.css',
  'styles/pages/mentions-legales/responsive-mobile.css',
];

const OFFLINE_STYLE_SOURCES = ['styles/pages/offline.css'];

const PAGE_STYLE_BY_HTML = {
  'index.html': { outfile: 'style-page-accueil.css', sources: ACCUEIL_STYLE_SOURCES },
  'projets.html': { outfile: 'style-page-projets.css', sources: ['styles/pages/projets.css'] },
  'competences.html': {
    outfile: 'style-page-competences.css',
    sources: COMPETENCES_STYLE_SOURCES,
  },
  'parcours.html': { outfile: 'style-page-parcours.css', sources: ['styles/pages/parcours.css'] },
  'contact.html': { outfile: 'style-page-contact.css', sources: CONTACT_STYLE_SOURCES },
  'dojo.html': { outfile: 'style-page-dojo.css', sources: DOJO_STYLE_SOURCES },
  'mentions-legales.html': {
    outfile: 'style-page-mentions-legales.css',
    sources: MENTIONS_LEGALES_STYLE_SOURCES,
  },
};

const BASE_STYLE_FILE = 'style-base.css';

function sourcesVersImports(sources) {
  return sources.map((s) => `@import url("${s}");`).join('\n');
}

function allMonolithSources() {
  const pageSources = Object.values(PAGE_STYLE_BY_HTML).flatMap(({ sources }) => sources);
  return [...BASE_STYLE_SOURCES, ...pageSources];
}

function genererStyleCss() {
  const header = [
    '/* Généré par build/sync-style-css.cjs — ne pas éditer à la main. */',
    '/* Breakpoints : CONTRIBUTING.md */',
    '',
  ].join('\n');
  return `${header}${sourcesVersImports(allMonolithSources())}\n`;
}

module.exports = {
  BASE_STYLE_FILE,
  BASE_STYLE_SOURCES,
  LAYOUT_STYLE_SOURCES,
  MODAL_STYLE_SOURCES,
  NAV_STYLE_SOURCES,
  ACCUEIL_STYLE_SOURCES,
  CONTACT_STYLE_SOURCES,
  DOJO_STYLE_SOURCES,
  COMPETENCES_STYLE_SOURCES,
  MENTIONS_LEGALES_STYLE_SOURCES,
  OFFLINE_STYLE_SOURCES,
  PAGE_STYLE_BY_HTML,
  allMonolithSources,
  genererStyleCss,
  sourcesVersImports,
};
