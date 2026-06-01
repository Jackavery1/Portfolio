/* ============================================
   Build script — orchestrateur (modules dans build/)
   ============================================ */

const fs = require('fs');
const path = require('path');

['clean-css', 'uglify-js'].forEach((dep) => {
  try {
    require.resolve(dep);
  } catch {
    console.error(
      `\n❌ Dépendance manquante: "${dep}"\n   → Exécutez: npm install\n`,
    );
    console.error(
      '   Si npm échoue avec UNABLE_TO_VERIFY_LEAF_SIGNATURE : proxy / certificat entreprise — voir README (section Dépannage npm).\n',
    );
    process.exit(1);
  }
});

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, 'dist');
const STAGING_DIR = path.join(ROOT, '.dist-staging');
const WATCH_MODE = process.argv.includes('--watch');

const { loadEnvFile, resolveBuildEnv } = require('./build/env.cjs');
const { syncDefaults } = require('./build/sync-defaults.cjs');
const { log, createDist, finalizeDist } = require('./build/fs-utils.cjs');
const { copyHTML, HTML_FILES } = require('./build/html.cjs');
const { minifyCSS } = require('./build/css.cjs');
const { minifyAllJs } = require('./build/js-minify.cjs');
const {
  optimizeImages,
  optimizePreviewImages,
  copyAssets,
} = require('./build/images.cjs');

loadEnvFile(ROOT);
syncDefaults();

const BUILD_ENV = resolveBuildEnv();
const SITE_BASE = BUILD_ENV.siteOrigin;

function watchSrc() {
  log('Mode watch — rebuild sur changement (hors node_modules)', 'info');

  const debounce = (fn, ms) => {
    let id;
    return () => {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  };
  const run = debounce(() => {
    runBuild().catch((e) => {
      log(e.message, 'error');
      process.exitCode = 1;
    });
  }, 250);

  const watchRoots = ['style.css', 'js', 'styles', 'assets', 'partials'];
  watchRoots.forEach((rel) => {
    const p = path.join(ROOT, rel);
    if (fs.existsSync(p)) {
      fs.watch(p, { recursive: true }, run);
    }
  });
  HTML_FILES.forEach((f) => {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) fs.watch(p, run);
  });

  log('Ctrl+C pour arrêter', 'info');
  process.on('SIGINT', () => {
    log('Watch arrêté', 'warning');
    process.exit(0);
  });
}

async function runBuild() {
  console.log(`\n${'='.repeat(50)}`);
  log('▶️  Démarrage du build...', 'info');
  console.log(`${'='.repeat(50)}\n`);

  try {
    createDist(STAGING_DIR);
    copyHTML(ROOT, STAGING_DIR, SITE_BASE);
    minifyCSS(ROOT, STAGING_DIR);
    minifyAllJs(ROOT, STAGING_DIR);
    await optimizeImages(ROOT, STAGING_DIR);
    await optimizePreviewImages(ROOT, STAGING_DIR);
    copyAssets(ROOT, STAGING_DIR);
    try {
      finalizeDist(STAGING_DIR, DIST_DIR);
    } catch (err) {
      log(
        `dist/ partiellement verrouillé (${err.message}) — staging complet dans .dist-staging/`,
        'warning',
      );
    }

    console.log(`\n${'='.repeat(50)}`);
    log('Build terminé — .dist-staging/ prêt à déployer', 'success');
    console.log(`${'='.repeat(50)}\n`);
  } catch (err) {
    log(`Erreur build: ${err.message}`, 'error');
    process.exit(1);
  }
}

async function main() {
  if (WATCH_MODE) {
    await runBuild();
    watchSrc();
  } else {
    await runBuild();
  }
}

main().catch((err) => {
  log(`Erreur fatale: ${err.message}`, 'error');
  process.exit(1);
});
