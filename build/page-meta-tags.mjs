export const PAGE_META_MARKER_START = '    <!-- PAGE_META_START -->';
export const PAGE_META_MARKER_END = '    <!-- PAGE_META_END -->';
const META_LIGNE_MAX = 100;

export function escapeHtmlAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function metaTag(attrName, attrValue, content) {
  const ligne = `    <meta ${attrName}="${escapeHtmlAttr(attrValue)}" content="${escapeHtmlAttr(content)}" />`;
  if (ligne.length <= META_LIGNE_MAX) return ligne;
  return `    <meta\n      ${attrName}="${escapeHtmlAttr(attrValue)}"\n      content="${escapeHtmlAttr(content)}"\n    />`;
}

export function balisesPageMeta(meta) {
  if (!meta) return '';

  const lines = [];

  if (meta.description) {
    lines.push(metaTag('name', 'description', meta.description));
  }
  if (meta.ogTitle) {
    lines.push(metaTag('property', 'og:title', meta.ogTitle));
  }
  if (meta.ogDescription) {
    lines.push(metaTag('property', 'og:description', meta.ogDescription));
  }
  if (meta.twitterTitle) {
    lines.push(metaTag('name', 'twitter:title', meta.twitterTitle));
  }
  if (meta.twitterDescription) {
    lines.push(metaTag('name', 'twitter:description', meta.twitterDescription));
  }

  return lines.join('\n');
}

export function blocPageMeta(meta) {
  const balises = balisesPageMeta(meta);
  if (!balises) return '';
  return `${PAGE_META_MARKER_START}\n${balises}\n${PAGE_META_MARKER_END}`;
}

export const PAGE_META_BLOCK_RE = / {4}<!-- PAGE_META_START -->[\s\S]*? {4}<!-- PAGE_META_END -->/;

export function remplacerBlocPageMeta(html, meta) {
  const bloc = blocPageMeta(meta);
  if (!bloc) return html;
  if (!html.includes(PAGE_META_MARKER_START)) return html;
  return html.replace(PAGE_META_BLOCK_RE, bloc);
}
