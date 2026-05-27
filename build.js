/* ============================================
   Build script — minify CSS/JS, optimize images, copy assets
   Racine du dépôt = source (pas de src/)
   ============================================ */

const fs = require("fs");
const path = require("path");

["clean-css", "uglify-js"].forEach((dep) => {
  try {
    require.resolve(dep);
  } catch {
    console.error(
      `\n❌ Dépendance manquante: "${dep}"\n   → Exécutez: npm install\n`,
    );
    console.error(
      "   Si npm échoue avec UNABLE_TO_VERIFY_LEAF_SIGNATURE : proxy / certificat entreprise — voir README (section Dépannage npm).\n",
    );
    process.exit(1);
  }
});

const CleanCSS = require("clean-css");
const UglifyJS = require("uglify-js");

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, "dist");
const WATCH_MODE = process.argv.includes("--watch");

const SITE_BASE = (
  process.env.PORTFOLIO_SITE_URL || "https://jackavery1.github.io/Portfolio"
).replace(/\/$/, "");

function urlPageProd(htmlFile) {
  if (htmlFile === "index.html") return `${SITE_BASE}/`;
  return `${SITE_BASE}/${htmlFile}`;
}

function injectSeoMeta(html, htmlFile) {
  const pageUrl = urlPageProd(htmlFile);
  const ogImage = `${SITE_BASE}/assets/og.png`;

  let out = html.replace(
    /content="assets\/og\.png"/g,
    `content="${ogImage}"`,
  );

  out = out.replace(
    '<link rel="canonical" href="" id="link-canonical" />',
    `<link rel="canonical" href="${pageUrl}" id="link-canonical" />`,
  );

  const ogUrlTag = `<meta property="og:url" content="${pageUrl}" id="meta-og-url" />`;
  if (out.includes('id="meta-og-url"')) {
    out = out.replace(
      /<meta property="og:url" content="[^"]*" id="meta-og-url" \/>/,
      ogUrlTag,
    );
  } else {
    out = out.replace(
      '<meta property="og:locale" content="fr_FR" />',
      `<meta property="og:locale" content="fr_FR" />\n    ${ogUrlTag}`,
    );
  }

  return out;
}

const PAGE_META = {
  "index.html": {
    description:
      "Portfolio de Joris Martinez, développeur web junior — reconversion, projets LSF et Floppy Bird, stage client. La Jarne · La Rochelle · premier poste.",
    ogDescription:
      "Développeur web junior — projets concrets, parcours de reconversion, disponible pour un premier poste.",
    twitterDescription:
      "Portfolio arcade de Joris Martinez — développeur web junior, La Rochelle.",
  },
  "projets.html": {
    description:
      "Projets web : LSF (Express/MongoDB), Floppy Bird (PWA), GameHub, site WordPress HubTraining, Pixel Quest.",
    ogDescription:
      "WORK — projets développeur web : full-stack, jeu Phaser, client réel WordPress.",
    twitterDescription:
      "Sélection de projets web — portfolio Joris Martinez.",
  },
  "competences.html": {
    description:
      "Stack technique : HTML/CSS/JS, Node/Express, Phaser, WordPress, SQL, Angular et Java en cours.",
    ogDescription:
      "STATS — niveaux par techno et soft skills.",
    twitterDescription:
      "Compétences développeur web — Joris Martinez.",
  },
  "parcours.html": {
    description:
      "Parcours agro → dev web : master sciences du végétal, BIOTEK/UNILET, TP, stage HubTraining, formation continue.",
    ogDescription:
      "STORY — timeline de reconversion vers le développement web.",
    twitterDescription:
      "Parcours professionnel — Joris Martinez.",
  },
  "contact.html": {
    description:
      "Contact et CV — Joris Martinez, développeur web junior, La Jarne (17220), disponible pour opportunités.",
    ogDescription:
      "CONTACT — formulaire, téléchargement du CV, premier poste recherché.",
    twitterDescription:
      "Contacter Joris Martinez — développeur web.",
  },
  "dojo.html": {
    description:
      "Dojo — exercices et boss techniques : DOM, Express, EJS, SQL, stack web, Angular et Java en cours.",
    ogDescription:
      "Entraînements et mini-projets hors portfolio principal.",
    twitterDescription:
      "Boss rush technique — portfolio Joris Martinez.",
  },
  "mentions-legales.html": {
    description:
      "Mentions légales du portfolio Joris Martinez — éditeur, hébergement, données personnelles.",
    ogDescription:
      "Mentions légales et politique de confidentialité.",
    twitterDescription:
      "Mentions légales — portfolio Joris Martinez.",
  },
};

function injectPageMeta(html, htmlFile) {
  const meta = PAGE_META[htmlFile];
  if (!meta) return html;

  let out = html;
  if (meta.description) {
    out = out.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${meta.description}" />`,
    );
  }
  if (meta.ogDescription) {
    out = out.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${meta.ogDescription}" />`,
    );
  }
  if (meta.twitterDescription) {
    out = out.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:description" content="${meta.twitterDescription}" />`,
    );
  }
  return out;
}

const PARTIAL_PLACEHOLDERS = [
  { id: "partial-crt", fichier: "partials/crt.html" },
  { id: "partial-marquee", fichier: "partials/marquee.html" },
  { id: "partial-nav", fichier: "partials/nav.html" },
  { id: "partial-footer", fichier: "partials/footer.html" },
  { id: "partial-popup-hs", fichier: "partials/popup-highscore.html" },
];

function inlinePartials(html) {
  let out = html;
  PARTIAL_PLACEHOLDERS.forEach(({ id, fichier }) => {
    const src = path.join(ROOT, fichier);
    if (!fs.existsSync(src)) return;
    const contenu = fs.readFileSync(src, "utf8").trim();
    const re = new RegExp(
      `<div id="${id}"[^>]*>\\s*</div>`,
      "i",
    );
    out = out.replace(re, contenu);
  });
  return out;
}

function injectPerfHead(html) {
  let out = html.replace(
    /Rajdhani:wght@400;600;700&display=swap/g,
    "Rajdhani:wght@400;600&display=swap",
  );
  const preload = '<link rel="preload" href="style.css" as="style" />';
  if (!out.includes('rel="preload" href="style.css"')) {
    out = out.replace(
      '<link rel="stylesheet" href="style.css" />',
      `${preload}\n    <link rel="stylesheet" href="style.css" />`,
    );
  }
  return out;
}

/* CSP injectée dans dist/ uniquement (meta : pas de frame-ancestors ; dev sans CSP) */
const CSP_META = `<meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://www.gstatic.com; frame-src https://www.google.com https://recaptcha.google.com; connect-src 'self' https://formspree.io https://www.google.com https://www.gstatic.com https://recaptcha.google.com; form-action 'self' https://formspree.io; base-uri 'self'; object-src 'none';"
    />`;

const HTML_FILES = [
  "index.html",
  "projets.html",
  "competences.html",
  "parcours.html",
  "contact.html",
  "dojo.html",
  "mentions-legales.html",
];

/* ============================================
   Utilities
   ============================================ */

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(src, dst) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  return true;
}

function copyDirRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  ensureDir(dst);
  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      copyFile(srcPath, dstPath);
    }
  });
}

function walkJsFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkJsFiles(p, acc);
    else if (p.endsWith(".js")) acc.push(p);
  }
  return acc;
}

function log(msg, type = "info") {
  const prefix =
    {
      info: "📋",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    }[type] || "→";
  console.log(`${prefix} ${msg}`);
}

/* ============================================
   Build functions
   ============================================ */

function createDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);
  log("Dossier dist/ créé");
}

function copyHTML() {
  let n = 0;
  const viewportNeedle =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />';

  HTML_FILES.forEach((file) => {
    const src = path.join(ROOT, file);
    const dst = path.join(DIST_DIR, file);
    if (!fs.existsSync(src)) return;

    let html = fs.readFileSync(src, "utf8");
    html = injectSeoMeta(html, file);
    html = injectPageMeta(html, file);
    html = injectPerfHead(html);
    html = inlinePartials(html);
    if (html.includes(viewportNeedle) && !html.includes("Content-Security-Policy")) {
      html = html.replace(viewportNeedle, `${viewportNeedle}\n    ${CSP_META}`);
    }
    ensureDir(path.dirname(dst));
    fs.writeFileSync(dst, html);
    n += 1;
  });
  log(`${n} fichier(s) HTML (SEO + perf + partials inlinés)`, "success");
}

function minifyCSS() {
  const srcFile = path.join(ROOT, "style.css");
  const dstFile = path.join(DIST_DIR, "style.css");

  if (!fs.existsSync(srcFile)) {
    log(`CSS source non trouvé: ${srcFile}`, "warning");
    return;
  }

  const input = fs.readFileSync(srcFile, "utf8");
  const result = new CleanCSS({
    level: 2,
    relativeTo: ROOT,
    rebaseTo: ROOT,
    inline: ["local"],
  }).minify({ "style.css": { styles: input } });

  if (result.errors && result.errors.length > 0) {
    log(`Erreurs CleanCSS: ${result.errors.join(", ")}`, "error");
    return;
  }

  ensureDir(path.dirname(dstFile));
  fs.writeFileSync(dstFile, result.styles);
  const originalSize = input.length;
  const minifiedSize = result.styles.length;
  const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
  log(
    `CSS minifié (@import inlinés): ${originalSize} → ${minifiedSize} octets (-${savings}%)`,
    "success",
  );
}

function minifyAllJs() {
  const jsRoot = path.join(ROOT, "js");
  const dstRoot = path.join(DIST_DIR, "js");
  if (!fs.existsSync(jsRoot)) {
    log("Dossier js/ non trouvé", "warning");
    return;
  }

  const files = walkJsFiles(jsRoot);
  let totalIn = 0;
  let totalOut = 0;
  const uglifyErrors = [];

  files.forEach((absSrc) => {
    const rel = path.relative(jsRoot, absSrc);
    const input = fs.readFileSync(absSrc, "utf8");
    const result = UglifyJS.minify({ [rel]: input }, {
      parse: { module: true },
      compress: { module: true, passes: 2 },
      mangle: true,
      output: { comments: false },
      module: true,
    });

    if (result.error) {
      uglifyErrors.push(`${rel}: ${result.error.message}`);
      return;
    }

    const dst = path.join(dstRoot, rel);
    ensureDir(path.dirname(dst));
    fs.writeFileSync(dst, result.code);
    totalIn += input.length;
    totalOut += result.code.length;
  });

  if (uglifyErrors.length) {
    uglifyErrors.forEach((m) => log(m, "error"));
    throw new Error("UglifyJS a échoué sur un ou plusieurs fichiers");
  }

  if (files.length === 0) {
    log("Aucun .js sous js/", "warning");
    return;
  }
  const savings = ((1 - totalOut / totalIn) * 100).toFixed(1);
  log(
    `${files.length} module(s) JS minifié(s): ${totalIn} → ${totalOut} octets (-${savings}%)`,
    "success",
  );
}

async function loadImageminPlugins() {
  const imagemin = (await import("imagemin")).default;
  const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
  const imageminPngquant = (await import("imagemin-pngquant")).default;
  const imageminWebp = (await import("imagemin-webp")).default;
  return { imagemin, imageminMozjpeg, imageminPngquant, imageminWebp };
}

async function optimizePreviewImages() {
  const srcDir = path.join(ROOT, "assets", "previews");
  const dstDir = path.join(DIST_DIR, "assets", "previews");

  if (!fs.existsSync(srcDir)) {
    log("Pas de assets/previews/ — ignoré", "warning");
    return;
  }

  const raster = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f));

  if (raster.length === 0) {
    log("Aucun aperçu PNG/JPEG dans assets/previews/", "warning");
    return;
  }

  try {
    const { imagemin, imageminPngquant, imageminWebp } =
      await loadImageminPlugins();
    ensureDir(dstDir);
    log(`Optimisation de ${raster.length} aperçu(s) projet…`, "info");

    for (const name of raster) {
      const buf = fs.readFileSync(path.join(srcDir, name));
      let optimized = buf;

      if (/\.png$/i.test(name)) {
        [optimized] = await imagemin.buffer(buf, {
          plugins: [imageminPngquant({ quality: [0.65, 0.85] })],
        });
      }

      fs.writeFileSync(path.join(dstDir, name), optimized);

      const webpBuf = await imagemin.buffer(optimized, {
        plugins: [imageminWebp({ quality: 78 })],
      });
      fs.writeFileSync(
        path.join(dstDir, name.replace(/\.(png|jpe?g)$/i, ".webp")),
        webpBuf,
      );
    }

    log(`Aperçus → ${dstDir} (+ WebP)`, "success");
  } catch (err) {
    log(`Erreur optimisation aperçus: ${err.message}`, "error");
    copyDirRecursive(srcDir, dstDir);
  }
}

async function optimizeImages() {
  const assetsDir = path.join(ROOT, "assets");
  const dstDir = path.join(DIST_DIR, "assets");

  if (!fs.existsSync(assetsDir)) {
    log("Pas de dossier assets/ — ignoré", "warning");
    return;
  }

  const raster = fs
    .readdirSync(assetsDir)
    .filter((f) => /\.(png|jpe?g)$/i.test(f));

  if (raster.length === 0) {
    log("Aucune image PNG/JPEG dans assets/", "warning");
    return;
  }

  try {
    const { imagemin, imageminMozjpeg, imageminPngquant, imageminWebp } =
      await loadImageminPlugins();
    ensureDir(dstDir);
    log(`Optimisation de ${raster.length} image(s)...`, "info");

    for (const name of raster) {
      const srcPath = path.join(assetsDir, name);
      const buf = fs.readFileSync(srcPath);
      const ext = path.extname(name).toLowerCase();
      let optimized = buf;

      if (ext === ".jpg" || ext === ".jpeg") {
        [optimized] = await imagemin.buffer(buf, {
          plugins: [imageminMozjpeg({ quality: 80 })],
        });
      } else if (ext === ".png") {
        [optimized] = await imagemin.buffer(buf, {
          plugins: [imageminPngquant({ quality: [0.6, 0.8] })],
        });
      }

      fs.writeFileSync(path.join(dstDir, name), optimized);

      const webpBuf = await imagemin.buffer(optimized, {
        plugins: [imageminWebp({ quality: 75 })],
      });
      const webpName = name.replace(/\.(png|jpe?g)$/i, ".webp");
      fs.writeFileSync(path.join(dstDir, webpName), webpBuf);
    }

    log(`Images → ${dstDir}`, "success");
  } catch (err) {
    log(`Erreur optimisation images: ${err.message}`, "error");
  }
}

function copyAssets() {
  const assetsToCopy = [
    {
      src: path.join(ROOT, "assets", "favicon.ico"),
      dst: path.join(DIST_DIR, "assets", "favicon.ico"),
    },
    {
      src: path.join(ROOT, "assets", "cv-martinez-joris.pdf"),
      dst: path.join(DIST_DIR, "assets", "cv-martinez-joris.pdf"),
    },
  ];

  assetsToCopy.forEach(({ src, dst }) => {
    if (!fs.existsSync(src)) {
      log(`Optionnel absent: ${path.relative(ROOT, src)}`, "warning");
      return;
    }
    if (fs.statSync(src).isDirectory()) {
      copyDirRecursive(src, dst);
    } else {
      copyFile(src, dst);
    }
  });

  log("Assets (previews, favicon) copiés", "success");
}

function watchSrc() {
  log("Mode watch — rebuild sur changement (hors node_modules)", "info");

  const debounce = (fn, ms) => {
    let id;
    return () => {
      clearTimeout(id);
      id = setTimeout(fn, ms);
    };
  };
  const run = debounce(() => {
    runBuild().catch((e) => {
      log(e.message, "error");
      process.exitCode = 1;
    });
  }, 250);

  const watchRoots = ["style.css", "js", "styles", "assets", "partials"];
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

  log("Ctrl+C pour arrêter", "info");
  process.on("SIGINT", () => {
    log("Watch arrêté", "warning");
    process.exit(0);
  });
}

async function runBuild() {
  console.log(`\n${"=".repeat(50)}`);
  log("▶️  Démarrage du build...", "info");
  console.log(`${"=".repeat(50)}\n`);

  try {
    createDist();
    copyHTML();
    minifyCSS();
    minifyAllJs();
    await optimizeImages();
    await optimizePreviewImages();
    copyAssets();

    console.log(`\n${"=".repeat(50)}`);
    log("Build terminé — dist/ prêt à déployer", "success");
    console.log(`${"=".repeat(50)}\n`);
  } catch (err) {
    log(`Erreur build: ${err.message}`, "error");
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
  log(`Erreur fatale: ${err.message}`, "error");
  process.exit(1);
});
