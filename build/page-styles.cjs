const BASE_STYLE_SOURCES = [
  'styles/tokens.css',
  'styles/fonts-local.css',
  'styles/reset.css',
  'styles/layout.css',
  'styles/components/crt.css',
  'styles/components/nav.css',
  'styles/components/modal.css',
  'styles/components/card.css',
  'styles/components/form.css',
  'styles/components/footer.css',
];

const PAGE_STYLE_BY_HTML = {
  'index.html': { outfile: 'style-page-accueil.css', sources: ['styles/pages/accueil.css'] },
  'projets.html': { outfile: 'style-page-projets.css', sources: ['styles/pages/projets.css'] },
  'competences.html': {
    outfile: 'style-page-competences.css',
    sources: ['styles/pages/competences.css'],
  },
  'parcours.html': { outfile: 'style-page-parcours.css', sources: ['styles/pages/parcours.css'] },
  'contact.html': { outfile: 'style-page-contact.css', sources: ['styles/pages/contact.css'] },
  'dojo.html': { outfile: 'style-page-dojo.css', sources: ['styles/pages/dojo.css'] },
  'mentions-legales.html': {
    outfile: 'style-page-mentions-legales.css',
    sources: ['styles/pages/mentions-legales.css'],
  },
};

const BASE_STYLE_FILE = 'style-base.css';

function sourcesVersImports(sources) {
  return sources.map((s) => `@import url("${s}");`).join('\n');
}

module.exports = {
  BASE_STYLE_FILE,
  BASE_STYLE_SOURCES,
  PAGE_STYLE_BY_HTML,
  sourcesVersImports,
};
