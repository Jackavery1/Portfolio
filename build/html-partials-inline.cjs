const fs = require('fs');
const path = require('path');
const { PARTIELS: PARTIAL_PLACEHOLDERS } = require('./partials-list.mjs');

function placeholderRegex(id) {
  return [
    new RegExp(`<div id="${id}"[^>]*>\\s*</div>`, 'i'),
    new RegExp(`<header\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/header>`, 'i'),
    new RegExp(`<footer\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/footer>`, 'i'),
    new RegExp(`<(?:nav|div)\\b[^>]*\\bid=["']${id}["'][^>]*>[\\s\\S]*?<\\/(?:nav|div)>`, 'i'),
  ];
}

function inlinePartials(html, root) {
  let out = html;
  PARTIAL_PLACEHOLDERS.forEach(({ id, fichier }) => {
    const src = path.join(root, fichier);
    if (!fs.existsSync(src)) return;
    const contenu = fs.readFileSync(src, 'utf8').trim();
    for (const re of placeholderRegex(id)) {
      if (!re.test(out)) continue;
      out = out.replace(re, contenu);
      break;
    }
  });
  return out;
}

module.exports = {
  inlinePartials,
  placeholderRegex,
};
