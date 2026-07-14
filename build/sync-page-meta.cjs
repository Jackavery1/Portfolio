const fs = require('fs');
const path = require('path');
const { PAGE_META } = require('./page-meta.mjs');
const { HTML_FILES } = require('./html-files.cjs');
const { remplacerBlocPageMeta } = require('./page-meta-tags.mjs');

function fichiersPageMetaDerives(root = path.join(__dirname, '..')) {
  const derives = [];

  HTML_FILES.forEach((file) => {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) return;

    const meta = PAGE_META[file];
    if (!meta) return;

    const initial = fs.readFileSync(filePath, 'utf8');
    const attendu = remplacerBlocPageMeta(initial, meta);
    if (attendu !== initial) {
      derives.push(file);
    }
  });

  return derives;
}

function syncPageMeta(root = path.join(__dirname, '..')) {
  fichiersPageMetaDerives(root).forEach((file) => {
    const filePath = path.join(root, file);
    const meta = PAGE_META[file];
    const initial = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, remplacerBlocPageMeta(initial, meta), 'utf8');
  });
}

function verifierPageMeta(root = path.join(__dirname, '..')) {
  return fichiersPageMetaDerives(root);
}

function resoudreRacine(argv = process.argv) {
  const index = argv.indexOf('--root');
  if (index >= 0 && argv[index + 1]) {
    return path.resolve(argv[index + 1]);
  }
  return path.join(__dirname, '..');
}

module.exports = {
  syncPageMeta,
  verifierPageMeta,
  fichiersPageMetaDerives,
  resoudreRacine,
  runCli,
};

function runCli(argv = process.argv) {
  const root = resoudreRacine(argv);
  const check = argv.includes('--check');

  if (check) {
    const derives = verifierPageMeta(root);
    if (derives.length) {
      console.error(
        `PAGE_META désynchronisé dans : ${derives.join(', ')} — exécutez npm run sync:page-meta`
      );
      process.exit(1);
    }
    return;
  }

  syncPageMeta(root);
}

if (require.main === module) {
  runCli();
}
