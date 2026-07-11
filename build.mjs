import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadBuild } from './build/cjs-bridge.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT, 'dist');
const STAGING_DIR = path.join(ROOT, '.dist-staging');
const WATCH_MODE = process.argv.includes('--watch');

['clean-css', 'uglify-js', 'sharp'].forEach((dep) => {
  try {
    require.resolve(dep);
  } catch {
    console.error(`\n❌ Dépendance manquante: "${dep}"\n   → Exécutez: npm install\n`);
    console.error(
      '   Si npm échoue avec UNABLE_TO_VERIFY_LEAF_SIGNATURE : voir CONTRIBUTING.md (Dépannage npm).\n'
    );
    process.exit(1);
  }
});

const { loadEnvFile, resolveBuildEnv } = loadBuild('env.cjs');
const { syncSource } = loadBuild('sync-source.cjs');
const { log, createDist, finalizeDist } = loadBuild('fs-utils.cjs');
const { copyHTML, HTML_FILES } = loadBuild('html.cjs');
const { writeSeoFiles } = loadBuild('seo.cjs');
const { patchOgImageWebp } = loadBuild('og-image.cjs');
const { copyFonts } = loadBuild('fonts.cjs');
const { minifyCSS } = loadBuild('css.cjs');
const { minifyAllJs } = loadBuild('js-minify.cjs');
const { optimizeImages, optimizePreviewImages, copyAssets, generatePwaIcons } =
  loadBuild('images.cjs');
const { writeServiceWorker } = loadBuild('sw.cjs');
const pkg = require('./package.json');

loadEnvFile(ROOT);

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

  const watchRoots = ['style.css', 'js', 'styles', 'assets', 'partials', 'build'];
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
    syncSource();
    createDist(STAGING_DIR);
    copyHTML(ROOT, STAGING_DIR, SITE_BASE);
    writeSeoFiles(STAGING_DIR, SITE_BASE);
    copyFonts(ROOT, STAGING_DIR);
    minifyCSS(ROOT, STAGING_DIR);
    minifyAllJs(ROOT, STAGING_DIR);
    await generatePwaIcons(ROOT, STAGING_DIR);
    await optimizeImages(ROOT, STAGING_DIR);
    await optimizePreviewImages(ROOT, STAGING_DIR);
    patchOgImageWebp(STAGING_DIR, SITE_BASE);
    copyAssets(ROOT, STAGING_DIR);
    writeServiceWorker(STAGING_DIR, pkg.version);
    fs.writeFileSync(path.join(STAGING_DIR, '.nojekyll'), '');
    for (const artefact of ['sw.js', 'manifest.webmanifest']) {
      const legacy = path.join(ROOT, artefact);
      if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
    }
    try {
      finalizeDist(STAGING_DIR, DIST_DIR);
    } catch (err) {
      log(
        `dist/ partiellement verrouillé (${err.message}) — staging complet dans .dist-staging/`,
        'warning'
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
