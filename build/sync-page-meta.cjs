const fs = require('fs');
const path = require('path');
const { PAGE_META } = require('./page-meta.cjs');
const { HTML_FILES } = require('./html.cjs');
const {
  remplacerBlocPageMeta,
} = require('./page-meta-tags.cjs');

function syncPageMeta(root = path.join(__dirname, '..')) {
  HTML_FILES.forEach((file) => {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) return;

    const meta = PAGE_META[file];
    if (!meta) return;

    const initial = fs.readFileSync(filePath, 'utf8');
    const html = remplacerBlocPageMeta(initial, meta);
    if (html !== initial) {
      fs.writeFileSync(filePath, html, 'utf8');
    }
  });
}

module.exports = { syncPageMeta };

if (require.main === module) {
  syncPageMeta();
}
