const fs = require('fs');
const path = require('path');
const BP = require('./breakpoints.mjs');

const DEBUT = '/* BREAKPOINTS_SYNC_START */';
const FIN = '/* BREAKPOINTS_SYNC_END */';

const REMPLACEMENTS_MEDIA = [
  [/min-width:\s*961px/g, `min-width: ${BP.DESKTOP}px`],
  [/max-width:\s*960px/g, `max-width: ${BP.MOBILE_MAX}px`],
  [/min-width:\s*700px/g, `min-width: ${BP.PROJETS_2COL_MIN}px`],
  [/min-width:\s*600px/g, `min-width: ${BP.TABLETTE_MIN}px`],
  [/max-width:\s*480px/g, `max-width: ${BP.MOBILE_COMPACT_MAX}px`],
  [/max-width:\s*320px/g, `max-width: ${BP.MOBILE_ETROIT_MAX}px`],
  [/max-height:\s*780px/g, `max-height: ${BP.ACCUEIL_SHORT_MAX_HEIGHT}px`],
  [/max-height:\s*552px/g, `max-height: ${BP.ACCUEIL_LANDSCAPE_MAX_HEIGHT}px`],
  [/min-height:\s*552px/g, `min-height: ${BP.ACCUEIL_LANDSCAPE_MAX_HEIGHT}px`],
];

function echapperRegex(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function genererVariablesBp() {
  return `${DEBUT}
  /** Seuils principaux — généré depuis build/breakpoints.mjs (non utilisables dans @media). */
  --bp-tablette-min: ${BP.TABLETTE_MIN}px;
  --bp-mobile-max: ${BP.MOBILE_MAX}px;
  --bp-desktop: ${BP.DESKTOP}px;
  --bp-mobile-compact: ${BP.MOBILE_COMPACT_MAX}px;
  --bp-mobile-etroit: ${BP.MOBILE_ETROIT_MAX}px;
  --bp-projets-2col: ${BP.PROJETS_2COL_MIN}px;
  --bp-accueil-landscape-h: ${BP.ACCUEIL_LANDSCAPE_MAX_HEIGHT}px;
  --bp-accueil-short-h: ${BP.ACCUEIL_SHORT_MAX_HEIGHT}px;
  ${FIN}`;
}

function syncMediaDansCss(css) {
  let result = css;
  for (const [pattern, remplacement] of REMPLACEMENTS_MEDIA) {
    result = result.replace(pattern, remplacement);
  }
  return result;
}

function listerFichiersCss(dossier) {
  const fichiers = [];
  const parcourir = (dir) => {
    for (const entree of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entree.name);
      if (entree.isDirectory()) parcourir(abs);
      else if (entree.name.endsWith('.css')) fichiers.push(abs);
    }
  };
  parcourir(dossier);
  return fichiers;
}

function syncMediaBreakpoints(root = path.join(__dirname, '..')) {
  const stylesRoot = path.join(root, 'styles');
  if (!fs.existsSync(stylesRoot)) return [];

  const modifies = [];
  for (const fichier of listerFichiersCss(stylesRoot)) {
    const avant = fs.readFileSync(fichier, 'utf8');
    const apres = syncMediaDansCss(avant);
    if (apres !== avant) {
      fs.writeFileSync(fichier, apres, 'utf8');
      modifies.push(path.relative(root, fichier));
    }
  }
  return modifies;
}

function extraireSeuilsMedia(css) {
  const seuils = new Set();
  const blocs = css.match(/@media[^{]+/g) || [];
  for (const bloc of blocs) {
    for (const match of bloc.matchAll(/(?:max|min)-(?:width|height):\s*(\d+)px/g)) {
      seuils.add(Number(match[1]));
    }
  }
  return seuils;
}

function verifierSeuilsMedia(root = path.join(__dirname, '..')) {
  const autorises = new Set(Object.values(BP));
  const invalides = [];

  for (const fichier of listerFichiersCss(path.join(root, 'styles'))) {
    const css = fs.readFileSync(fichier, 'utf8');
    for (const seuil of extraireSeuilsMedia(css)) {
      if (!autorises.has(seuil)) {
        invalides.push({ fichier: path.relative(root, fichier), seuil });
      }
    }
  }
  return invalides;
}

function syncBreakpoints(root = path.join(__dirname, '..')) {
  const tokensPath = path.join(root, 'styles', 'tokens.css');
  let css = fs.readFileSync(tokensPath, 'utf8');
  const bloc = genererVariablesBp();

  if (css.includes(DEBUT) && css.includes(FIN)) {
    css = css.replace(new RegExp(`${echapperRegex(DEBUT)}[\\s\\S]*?${echapperRegex(FIN)}`), bloc);
  } else {
    css = css.replace(
      /\/\*\* Seuils principaux[\s\S]*?--bp-accueil-short-h: \d+px;\n/,
      `${bloc}\n`
    );
  }

  css = syncMediaDansCss(css);
  fs.writeFileSync(tokensPath, css, 'utf8');
  syncMediaBreakpoints(root);
}

module.exports = {
  syncBreakpoints,
  syncMediaBreakpoints,
  syncMediaDansCss,
  genererVariablesBp,
  verifierSeuilsMedia,
  extraireSeuilsMedia,
  listerFichiersCss,
};

const { executerSiEntreeDirecte } = require('./cli-entry.mjs');
executerSiEntreeDirecte(require.main, module, syncBreakpoints);
