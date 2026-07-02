const PAGE_META_MARKER_START = '    <!-- PAGE_META_START -->';
const PAGE_META_MARKER_END = '    <!-- PAGE_META_END -->';

function escapeHtmlAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function balisesPageMeta(meta) {
  if (!meta) return '';

  const lines = [];

  if (meta.description) {
    lines.push(
      `    <meta\n      name="description"\n      content="${escapeHtmlAttr(meta.description)}"\n    />`
    );
  }
  if (meta.ogTitle) {
    lines.push(`    <meta property="og:title" content="${escapeHtmlAttr(meta.ogTitle)}" />`);
  }
  if (meta.ogDescription) {
    lines.push(
      `    <meta\n      property="og:description"\n      content="${escapeHtmlAttr(meta.ogDescription)}"\n    />`
    );
  }
  if (meta.twitterTitle) {
    lines.push(`    <meta name="twitter:title" content="${escapeHtmlAttr(meta.twitterTitle)}" />`);
  }
  if (meta.twitterDescription) {
    lines.push(
      `    <meta\n      name="twitter:description"\n      content="${escapeHtmlAttr(meta.twitterDescription)}"\n    />`
    );
  }

  return lines.join('\n');
}

function blocPageMeta(meta) {
  const balises = balisesPageMeta(meta);
  if (!balises) return '';
  return `${PAGE_META_MARKER_START}\n${balises}\n${PAGE_META_MARKER_END}`;
}

const PAGE_META_BLOCK_RE = / {4}<!-- PAGE_META_START -->[\s\S]*? {4}<!-- PAGE_META_END -->/;

function remplacerBlocPageMeta(html, meta) {
  const bloc = blocPageMeta(meta);
  if (!bloc) return html;
  if (!html.includes(PAGE_META_MARKER_START)) return html;
  return html.replace(PAGE_META_BLOCK_RE, bloc);
}

module.exports = {
  PAGE_META_MARKER_START,
  PAGE_META_MARKER_END,
  PAGE_META_BLOCK_RE,
  escapeHtmlAttr,
  balisesPageMeta,
  blocPageMeta,
  remplacerBlocPageMeta,
};
