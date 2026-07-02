const fs = require('fs');
const path = require('path');
const BP = require('./breakpoints.cjs');

const DEBUT = '/* BREAKPOINTS_SYNC_START */';
const FIN = '/* BREAKPOINTS_SYNC_END */';

function echapperRegex(texte) {
  return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function genererVariablesBp() {
  return `${DEBUT}
/** Seuils principaux — généré depuis build/breakpoints.cjs (non utilisables dans @media). */
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

  css = css.replace(/@media \(max-width: \d+px\)/, `@media (max-width: ${BP.MOBILE_MAX}px)`);

  fs.writeFileSync(tokensPath, css, 'utf8');
}

module.exports = { syncBreakpoints, genererVariablesBp };

if (require.main === module) {
  syncBreakpoints();
}
